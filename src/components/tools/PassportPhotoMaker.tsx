import { useState, useRef, useEffect } from 'react';
import { Upload, Download, Move, Scissors, Printer, RefreshCw, ZoomIn, Image as ImageIcon, Plus, Minus, Eye } from 'lucide-react';

type PhotoSize = 'passport' | 'fitInPaper' | 'document' | 'custom';
type PaperSize = 'A4' | 'Legal' | 'Letter' | 'custom';

interface CustomPhotoSize {
    width: number;
    height: number;
}

interface CustomPaperSize {
    width: number;
    height: number;
}

const PHOTO_SIZES: Record<PhotoSize, { name: string; widthMm: number; heightMm: number; label: string }> = {
    passport: { name: 'Passport Size', widthMm: 35, heightMm: 45, label: '35 x 45 mm' },
    fitInPaper: { name: 'Fit in Paper', widthMm: 35, heightMm: 45, label: 'Auto-fit copies' },
    document: { name: 'Document Size', widthMm: 30, heightMm: 40, label: '30 x 40 mm' },
    custom: { name: 'Custom Size', widthMm: 35, heightMm: 45, label: 'Custom' },
};

const PAPERS: Record<PaperSize, { name: string; widthMm: number; heightMm: number }> = {
    'A4': { name: 'A4 Size', widthMm: 210, heightMm: 297 },
    'Legal': { name: 'Photo Paper', widthMm: 101.6, heightMm: 152.4 },
    'Letter': { name: 'Letter Size', widthMm: 215.9, heightMm: 279.4 },
    'custom': { name: 'Custom Size', widthMm: 210, heightMm: 297 },
};

export default function PassportPhotoMaker() {
    const [image, setImage] = useState<string | null>(null);
    const [photoSize, setPhotoSize] = useState<PhotoSize>('passport');
    const [paper, setPaper] = useState<PaperSize>('A4');
    const [numCopies, setNumCopies] = useState(6);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [gapMm, setGapMm] = useState(3);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [customPhotoSize, setCustomPhotoSize] = useState<CustomPhotoSize>({ width: 35, height: 45 });
    const [customPaperSize, setCustomPaperSize] = useState<CustomPaperSize>({ width: 210, height: 297 });
    const [previewLayout, setPreviewLayout] = useState<{ x: number; y: number }[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getActivePhotoSize = () => {
        if (photoSize === 'custom') {
            return customPhotoSize;
        }
        if (photoSize === 'fitInPaper') {
            // Calculate optimal photo size to fit all copies in the paper
            const paperW = paper === 'custom' ? customPaperSize.width : PAPERS[paper].widthMm;
            const paperH = paper === 'custom' ? customPaperSize.height : PAPERS[paper].heightMm;
            const gap = gapMm;
            const copies = numCopies;

            // Find best grid arrangement to maximize photo size
            let bestPhotoW = 0, bestPhotoH = 0;

            for (let cols = 1; cols <= copies; cols++) {
                const rows = Math.ceil(copies / cols);
                const availableW = (paperW - gap * (cols + 1)) / cols;
                const availableH = (paperH - gap * (rows + 1)) / rows;

                // Maintain 35:45 aspect ratio (passport standard)
                const aspectRatio = 35 / 45;
                let photoW = availableW;
                let photoH = photoW / aspectRatio;

                if (photoH > availableH) {
                    photoH = availableH;
                    photoW = photoH * aspectRatio;
                }

                if (photoW > bestPhotoW) {
                    bestPhotoW = photoW;
                    bestPhotoH = photoH;
                }
            }

            return { width: Math.floor(bestPhotoW * 10) / 10, height: Math.floor(bestPhotoH * 10) / 10 };
        }
        return { width: PHOTO_SIZES[photoSize].widthMm, height: PHOTO_SIZES[photoSize].heightMm };
    };

    const getActivePaperSize = () => {
        if (paper === 'custom') {
            return customPaperSize;
        }
        return { width: PAPERS[paper].widthMm, height: PAPERS[paper].heightMm };
    };

    const photoSizeData = getActivePhotoSize();
    const paperSizeData = getActivePaperSize();

    // Reset crop on new image
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                setZoom(1);
                setPan({ x: 0, y: 0 });
                setProcessedImage(null);
                setPreviewLayout([]);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // --- DRAG LOGIC ---
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);


    // --- GENERATE SINGLE CROP ---
    // We do this to create the "Tile" that will be repeated
    useEffect(() => {
        if (!image || !containerRef.current || !imageRef.current) return;

        // Debounce generation slightly or just render on button click? 
        // For smoothness, let's render standard preview on demand or affect styling only.
        // We'll generate the final "Sheet" on the fly.
    }, [image, zoom, pan]);


    const generateSheet = () => {
        if (!image || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Setup Canvas for Single Photo High Res
        // We want 300 DPI. 1 mm = 11.8 px
        const DPI_SCALE = 11.8;
        const photoW = photoSizeData.width * DPI_SCALE;
        const photoH = photoSizeData.height * DPI_SCALE;

        // Set canvas to single photo size first to perform the crop
        canvas.width = photoW;
        canvas.height = photoH;

        // Draw Image with transforms
        const img = new Image();
        img.src = image;
        img.onload = () => {
            // Clear
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Resolution Multiplier (Screen to Canvas)
            const containerW = 320; // Fixed preview width in pixels
            const scaleFactor = photoW / containerW;

            // Transforms
            ctx.translate(canvas.width / 2, canvas.height / 2); // Center pivot
            ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor); // Pan
            ctx.scale(zoom, zoom); // Zoom

            // Draw centered
            const aspect = img.width / img.height;
            let drawW = canvas.width;
            let drawH = canvas.width / aspect;

            if (drawH < canvas.height) {
                drawH = canvas.height;
                drawW = canvas.height * aspect;
            }

            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

            // 2. Now we have the Single Photo in Canvas. Save it.
            const singlePhotoDataUrl = canvas.toDataURL('image/jpeg', 1.0);
            setProcessedImage(singlePhotoDataUrl);

            // Calculate preview layout
            const paperW = paperSizeData.width;
            const paperH = paperSizeData.height;
            const photoWidth = photoSizeData.width;
            const photoHeight = photoSizeData.height;
            const gap = gapMm;

            // For Fit in Paper mode, calculate optimal grid based on numCopies
            let cols: number, rows: number;

            if (photoSize === 'fitInPaper') {
                // Find optimal grid that maximizes photo size
                let bestCols = 1;
                let bestPhotoW = 0;

                for (let c = 1; c <= numCopies; c++) {
                    const r = Math.ceil(numCopies / c);
                    const availableW = (paperW - gap * (c + 1)) / c;
                    const availableH = (paperH - gap * (r + 1)) / r;

                    const aspectRatio = 35 / 45;
                    let pW = availableW;
                    let pH = pW / aspectRatio;

                    if (pH > availableH) {
                        pH = availableH;
                        pW = pH * aspectRatio;
                    }

                    if (pW > bestPhotoW) {
                        bestPhotoW = pW;
                        bestCols = c;
                    }
                }

                cols = bestCols;
                rows = Math.ceil(numCopies / cols);
            } else {
                // Standard calculation for fixed photo sizes
                cols = Math.floor((paperW - gap) / (photoWidth + gap));
                rows = Math.floor((paperH - gap) / (photoHeight + gap));
            }

            let positions: { x: number; y: number }[] = [];
            let photoCount = 0;

            // Calculate centered offset for the entire grid
            const totalGridW = cols * photoWidth + (cols - 1) * gap;
            const totalGridH = rows * photoHeight + (rows - 1) * gap;
            const offsetX = (paperW - totalGridW) / 2;
            const offsetY = (paperH - totalGridH) / 2;

            // Place photos in grid from top-left to bottom-right
            for (let r = 0; r < rows && photoCount < numCopies; r++) {
                for (let c = 0; c < cols && photoCount < numCopies; c++) {
                    const x = offsetX + c * (photoWidth + gap);
                    const y = offsetY + r * (photoHeight + gap);
                    positions.push({ x, y });
                    photoCount++;
                }
            }

            setPreviewLayout(positions);
        };
    };

    // --- DOWNLOAD SHEET ---
    const downloadSheet = () => {
        if (!processedImage || !canvasRef.current) return;

        const sheetCanvas = canvasRef.current;
        const ctx = sheetCanvas.getContext('2d');
        if (!ctx) return;

        const DPI_SCALE = 11.8; // 300 DPI

        // Setup Sheet Dimensions
        const sheetW = paperSizeData.width * DPI_SCALE;
        const sheetH = paperSizeData.height * DPI_SCALE;
        sheetCanvas.width = sheetW;
        sheetCanvas.height = sheetH;

        // Fill White Background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, sheetW, sheetH);

        // Load Single Photo
        const img = new Image();
        img.src = processedImage;
        img.onload = () => {
            const photoW = photoSizeData.width * DPI_SCALE;
            const photoH = photoSizeData.height * DPI_SCALE;

            // Use preview layout positions
            previewLayout.forEach((pos) => {
                const x = pos.x * DPI_SCALE;
                const y = pos.y * DPI_SCALE;
                ctx.drawImage(img, x, y, photoW, photoH);

                // Optional: Crop marks or border
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, photoW, photoH);
            });

            // Trigger Download
            const link = document.createElement('a');
            link.download = `Passport-Photos-${photoSize}-${paper}-${numCopies}copies.jpg`;
            link.href = sheetCanvas.toDataURL('image/jpeg', 0.95);
            link.click();
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16 pb-4">
            <div className="w-full max-w-[1600px] mx-auto px-4">

                {/* Compact Header */}
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Passport Photo Generator</h1>
                    <p className="text-gray-500 text-sm">Create print-ready passport photos • Free & Secure</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-4 items-start">

                    {/* LEFT: UPLOAD & CROP */}
                    <div className="lg:col-span-4 space-y-3">

                        {/* UPLOAD SECTION */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-sm font-bold text-gray-900 flex items-center"><Upload className="w-4 h-4 mr-1 text-blue-600" /> Upload Photo</h2>
                            </div>

                            {!image ? (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Click to upload</p>
                                    <p className="text-xs text-gray-400">JPG, PNG • Max 10MB</p>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            ) : (
                                <div className="space-y-2">
                                    {/* CROPPER - Compact */}
                                    <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-inner flex items-center justify-center" style={{ height: '200px' }}>
                                        <div
                                            ref={containerRef}
                                            className="relative overflow-hidden cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] z-10 border-2 border-white/50"
                                            style={{
                                                width: '160px',
                                                height: `${160 * (photoSizeData.height / photoSizeData.width)}px`
                                            }}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                        >
                                            {/* Grid Lines */}
                                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                                                <div className="border-r border-b border-white"></div>
                                                <div className="border-r border-b border-white"></div>
                                                <div className="border-b border-white"></div>
                                                <div className="border-r border-b border-white"></div>
                                                <div className="border-r border-b border-white"></div>
                                                <div className="border-b border-white"></div>
                                                <div className="border-r border-white"></div>
                                                <div className="border-r border-white"></div>
                                            </div>

                                            <img
                                                ref={imageRef}
                                                src={image}
                                                alt="Crop"
                                                className="max-w-none absolute left-1/2 top-1/2 origin-center select-none"
                                                style={{
                                                    transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                                    height: '100%',
                                                    minWidth: '100%',
                                                    minHeight: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                draggable={false}
                                            />
                                        </div>
                                        <div className="absolute bottom-2 text-white/50 text-xs pointer-events-none flex items-center">
                                            <Move size={10} className="mr-1" /> Drag to pan
                                        </div>
                                    </div>

                                    {/* Zoom - Inline */}
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                        <ZoomIn size={14} className="text-gray-500" />
                                        <input
                                            type="range"
                                            min="1"
                                            max="3"
                                            step="0.1"
                                            value={zoom}
                                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <span className="text-xs text-gray-500 w-8">{zoom.toFixed(1)}x</span>
                                    </div>

                                    <button
                                        onClick={() => { setImage(null); setProcessedImage(null); setPreviewLayout([]); }}
                                        className="w-full py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        Change Photo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MIDDLE: OPTIONS */}
                    <div className="lg:col-span-4 space-y-3">

                        {/* PHOTO SIZE - Compact Grid */}
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-bold text-gray-900 flex items-center mb-2"><ImageIcon className="w-4 h-4 mr-1 text-purple-600" /> Photo Size</h2>
                            <div className="grid grid-cols-2 gap-1.5">
                                {(Object.keys(PHOTO_SIZES) as PhotoSize[]).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => { setPhotoSize(key); setProcessedImage(null); setPreviewLayout([]); }}
                                        className={`p-2 rounded-lg border text-xs font-medium transition-all ${photoSize === key ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <div>{PHOTO_SIZES[key].name}</div>
                                        <div className="text-[10px] opacity-60">{PHOTO_SIZES[key].label}</div>
                                    </button>
                                ))}
                            </div>
                            {photoSize === 'custom' && (
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input type="number" value={customPhotoSize.width} onChange={(e) => setCustomPhotoSize({ ...customPhotoSize, width: parseFloat(e.target.value) || 35 })} placeholder="W (mm)" className="px-2 py-1 border border-gray-300 rounded text-xs" />
                                    <input type="number" value={customPhotoSize.height} onChange={(e) => setCustomPhotoSize({ ...customPhotoSize, height: parseFloat(e.target.value) || 45 })} placeholder="H (mm)" className="px-2 py-1 border border-gray-300 rounded text-xs" />
                                </div>
                            )}
                        </div>

                        {/* PAPER SIZE - Compact */}
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-bold text-gray-900 flex items-center mb-2"><Printer className="w-4 h-4 mr-1 text-green-600" /> Paper Size</h2>
                            <div className="grid grid-cols-2 gap-1.5">
                                {(Object.keys(PAPERS) as PaperSize[]).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => { setPaper(key); setPreviewLayout([]); }}
                                        className={`p-2 rounded-lg border text-xs font-medium transition-all ${paper === key ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        {PAPERS[key].name}
                                    </button>
                                ))}
                            </div>
                            {paper === 'custom' && (
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input type="number" value={customPaperSize.width} onChange={(e) => setCustomPaperSize({ ...customPaperSize, width: parseFloat(e.target.value) || 210 })} placeholder="W (mm)" className="px-2 py-1 border border-gray-300 rounded text-xs" />
                                    <input type="number" value={customPaperSize.height} onChange={(e) => setCustomPaperSize({ ...customPaperSize, height: parseFloat(e.target.value) || 297 })} placeholder="H (mm)" className="px-2 py-1 border border-gray-300 rounded text-xs" />
                                </div>
                            )}
                        </div>

                        {/* COPIES - Compact Inline */}
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-bold text-gray-900 mb-2">📋 Copies</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setNumCopies(Math.max(1, numCopies - 1))} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Minus size={16} /></button>
                                <input type="number" value={numCopies} onChange={(e) => setNumCopies(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1 px-2 py-1.5 text-center text-lg font-bold border border-gray-300 rounded-lg" />
                                <button onClick={() => setNumCopies(numCopies + 1)} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><Plus size={16} /></button>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-2">
                            <button onClick={generateSheet} disabled={!image} className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                <RefreshCw size={16} className="mr-1.5" /> Generate
                            </button>
                            {processedImage && (
                                <button onClick={downloadSheet} className="flex-1 py-2.5 text-sm font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 flex items-center justify-center">
                                    <Download size={16} className="mr-1.5" /> Download
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: PREVIEW */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center mb-2">
                                <h2 className="text-sm font-bold text-gray-900 flex items-center"><Eye className="w-4 h-4 mr-1 text-indigo-600" /> Preview</h2>
                                {processedImage && <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Ready</span>}
                            </div>

                            {!processedImage ? (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                                    <p className="text-xs text-center px-4">Upload photo & generate preview</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Sheet Preview - Compact */}
                                    <div className="bg-gray-200 rounded-lg p-2 flex items-center justify-center overflow-hidden border border-gray-300">
                                        <div className="bg-white shadow-lg relative" style={{ aspectRatio: `${paperSizeData.width}/${paperSizeData.height}`, width: '100%', maxHeight: '280px' }}>
                                            <div className="w-full h-full relative p-1 bg-white">
                                                <svg width="100%" height="100%" viewBox={`0 0 ${paperSizeData.width} ${paperSizeData.height}`} className="absolute inset-0">
                                                    {previewLayout.map((pos, idx) => (
                                                        <rect key={idx} x={pos.x} y={pos.y} width={photoSizeData.width} height={photoSizeData.height} fill="rgba(59, 130, 246, 0.1)" stroke="rgb(59, 130, 246)" strokeWidth="0.5" />
                                                    ))}
                                                </svg>
                                                <div className="w-full h-full relative flex flex-wrap content-start gap-0.5 p-0.5 overflow-hidden">
                                                    {previewLayout.map((_, idx) => (
                                                        <div key={idx} className="flex-shrink-0 bg-gray-100 border border-gray-300 overflow-hidden rounded-sm" style={{ width: `${(photoSizeData.width / paperSizeData.width) * 100}%`, aspectRatio: `${photoSizeData.width}/${photoSizeData.height}` }}>
                                                            <img src={processedImage} alt={`Copy ${idx + 1}`} className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Compact Info */}
                                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                                        <div className="p-1.5 bg-blue-50 rounded text-center"><span className="block text-gray-500">Paper</span><span className="font-bold text-blue-700">{paperSizeData.width}×{paperSizeData.height}</span></div>
                                        <div className="p-1.5 bg-purple-50 rounded text-center"><span className="block text-gray-500">Photo</span><span className="font-bold text-purple-700">{photoSizeData.width}×{photoSizeData.height}</span></div>
                                        <div className="p-1.5 bg-green-50 rounded text-center"><span className="block text-gray-500">Copies</span><span className="font-bold text-green-700">{numCopies}</span></div>
                                        <div className="p-1.5 bg-orange-50 rounded text-center"><span className="block text-gray-500">Gap</span><span className="font-bold text-orange-700">{gapMm}mm</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Hidden Canvas Worker */}
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
}
