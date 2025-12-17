import { useState, useRef, useEffect } from 'react';
import { Upload, Download, Maximize2, Move, Scissors, Printer, RefreshCw, ZoomIn, Image as ImageIcon } from 'lucide-react';

type PassportStandard = 'IN' | 'US' | 'UK';
type PaperSize = 'A4' | '4x6';

const STANDARDS: Record<PassportStandard, { name: string; widthMm: number; heightMm: number; label: string }> = {
    IN: { name: 'India (PAN/Passport)', widthMm: 35, heightMm: 45, label: '35 x 45 mm' },
    US: { name: 'USA (Visa/Passport)', widthMm: 51, heightMm: 51, label: '2 x 2 inch' },
    UK: { name: 'UK / Europe', widthMm: 35, heightMm: 45, label: '35 x 45 mm' },
};

const PAPERS: Record<PaperSize, { name: string; widthMm: number; heightMm: number }> = {
    '4x6': { name: '4 x 6 inch (Standard)', widthMm: 101.6, heightMm: 152.4 }, // 4x6 inches
    'A4': { name: 'A4 Size', widthMm: 210, heightMm: 297 },
};

export default function PassportPhotoMaker() {
    const [image, setImage] = useState<string | null>(null);
    const [standard, setStandard] = useState<PassportStandard>('IN');
    const [paper, setPaper] = useState<PaperSize>('4x6');
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [gapMm, setGapMm] = useState(2);
    const [maxPhotos, setMaxPhotos] = useState<number | null>(null); // null = Auto/Fill
    const [processedImage, setProcessedImage] = useState<string | null>(null); // The cropped single photo

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null); // Hidden canvas for processing

    const activeStandard = STANDARDS[standard];

    // Reset crop on new image
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                setZoom(1);
                setPan({ x: 0, y: 0 });
                setProcessedImage(null);
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
    }, [image, zoom, pan, standard]);


    const generateSheet = () => {
        if (!image || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Setup Canvas for Single Photo High Res
        // We want 300 DPI. 1 mm = 11.8 px
        const DPI_SCALE = 11.8;
        const photoW = activeStandard.widthMm * DPI_SCALE;
        const photoH = activeStandard.heightMm * DPI_SCALE;

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

            // Math to map the "Screen View" to "Canvas Resolution"
            // The container on screen is roughly 300px wide (depending on css)
            // We need to calculate the relative position of the image

            // Simplified approach: rely on the user's view relative percentages
            // BUT, for precision, let's try to replicate the CSS transform in Canvas

            // Ideally we find the visible rect of the image in the container
            // and draw that slice.

            // For MVP: Let's assume the user visually aligned it.
            // We will draw the image centered, scaled by 'zoom', and translated by 'pan' (scaled to resolution)

            // Resolution Multiplier (Screen to Canvas)
            // Screen container width ~ 300px (approx, based on UI) relative to standard.
            // Let's standardise the container preview to be, say, 300px width.
            const containerW = 320; // Fixed preview width in pixels
            const scaleFactor = photoW / containerW;

            // Transforms
            ctx.translate(canvas.width / 2, canvas.height / 2); // Center pivot
            ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor); // Pan
            ctx.scale(zoom, zoom); // Zoom

            // Draw centered
            // We need to maintain aspect ratio of source image
            const aspect = img.width / img.height;
            let drawW = canvas.width;
            let drawH = canvas.width / aspect;

            // If image is portrait vs landscape, fitting might vary, but usually we cover
            // Let's fit width 100% then scale
            if (drawH < canvas.height) {
                drawH = canvas.height;
                drawW = canvas.height * aspect;
            }

            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

            // 2. Now we have the Single Photo in Canvas. Save it.
            const singlePhotoDataUrl = canvas.toDataURL('image/jpeg', 1.0);
            setProcessedImage(singlePhotoDataUrl);
        };
    };

    // --- DOWNLOAD SHEET ---
    const downloadSheet = () => {
        if (!processedImage || !canvasRef.current) return;

        const sheetCanvas = canvasRef.current;
        const ctx = sheetCanvas.getContext('2d');
        if (!ctx) return;

        const activePaper = PAPERS[paper];
        const DPI_SCALE = 11.8; // 300 DPI

        // Setup Sheet Dimensions
        const sheetW = activePaper.widthMm * DPI_SCALE;
        const sheetH = activePaper.heightMm * DPI_SCALE;
        sheetCanvas.width = sheetW;
        sheetCanvas.height = sheetH;

        // Fill White Background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, sheetW, sheetH);

        // Load Single Photo
        const img = new Image();
        img.src = processedImage;
        img.onload = () => {
            const photoW = activeStandard.widthMm * DPI_SCALE;
            const photoH = activeStandard.heightMm * DPI_SCALE;
            const gap = 2 * DPI_SCALE; // 2mm gap

            // Calculate Grid
            const cols = Math.floor((sheetW - gap) / (photoW + gap));
            const rows = Math.floor((sheetH - gap) / (photoH + gap));

            // Center the Grid
            const totalGridW = cols * photoW + (cols - 1) * gap;
            const totalGridH = rows * photoH + (rows - 1) * gap;

            const startX = (sheetW - totalGridW) / 2;
            const startY = (sheetH - totalGridH) / 2;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = startX + c * (photoW + gap);
                    const y = startY + r * (photoH + gap);
                    ctx.drawImage(img, x, y, photoW, photoH);

                    // Optional: Crop marks or border
                    ctx.strokeStyle = '#ddd';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, photoW, photoH);
                }
            }

            // Trigger Download
            const link = document.createElement('a');
            link.download = `Passport-Photos-${standard}-${paper}.jpg`;
            link.href = sheetCanvas.toDataURL('image/jpeg', 0.95);
            link.click();
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 lg:pt-24 pb-12">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Passport Photo Maker</h1>
                    <p className="text-gray-600">Create print-ready passport size photos in seconds. Free & Secure.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT: EDITOR */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center"><Scissors className="w-5 h-5 mr-2 text-blue-600" /> Editor</h2>
                            <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500">Step 1</span>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6">

                            {/* Standard Selector */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">1. Choose Standard</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {(Object.keys(STANDARDS) as PassportStandard[]).map(key => (
                                        <button
                                            key={key}
                                            onClick={() => { setStandard(key); setProcessedImage(null); }}
                                            className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${standard === key ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            <span>{STANDARDS[key].name}</span>
                                            <span className="text-xs opacity-60 bg-white px-2 py-0.5 rounded border">{STANDARDS[key].label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Upload Or Crop Area */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">2. Upload & Adjust</label>

                                {!image ? (
                                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">Click to upload photo</p>
                                        <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                ) : (
                                    <div className="space-y-4">
                                        {/* CROPPER */}
                                        <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center" style={{ height: '400px' }}>

                                            {/* Reference Frame to show Standard Aspect Ratio */}
                                            <div
                                                ref={containerRef}
                                                className="relative overflow-hidden cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] z-10 border-2 border-white/50"
                                                style={{
                                                    width: '320px',
                                                    height: `${320 * (activeStandard.heightMm / activeStandard.widthMm)}px`
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
                                                        // We set height 100% implicitly to fit, then zoom/pan
                                                        minWidth: '100%',
                                                        minHeight: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                    draggable={false}
                                                />
                                            </div>

                                            {/* Overlay Hints */}
                                            <div className="absolute bottom-4 text-white/50 text-xs font-medium pointer-events-none flex items-center">
                                                <Move size={12} className="mr-1" /> Drag to pan
                                            </div>
                                        </div>

                                        {/* Sliders */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <ZoomIn size={16} className="text-gray-500" />
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="3"
                                                    step="0.1"
                                                    value={zoom}
                                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>1x</span>
                                                <span>Zoom</span>
                                                <span>3x</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setImage(null); setProcessedImage(null); }}
                                                className="flex-1 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                                            >
                                                Change Photo
                                            </button>
                                            <button
                                                onClick={generateSheet}
                                                className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center justify-center animate-pulse-once"
                                            >
                                                <RefreshCw size={16} className="mr-2" />
                                                Preview Sheet
                                            </button>
                                        </div>

                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* RIGHT: PREVIEW & DOWNLOAD */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* 1. Single Preview (Optional validation) */}
                        {processedImage && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center"><Printer className="w-5 h-5 mr-2 text-green-600" /> Print Preview</h2>
                                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded border border-green-200">Ready to Print</span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Settings */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Paper Size</label>
                                        <div className="grid grid-cols-1 gap-2 mb-6">
                                            {(Object.keys(PAPERS) as PaperSize[]).map(key => (
                                                <button
                                                    key={key}
                                                    onClick={() => setPaper(key)}
                                                    className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${paper === key ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                                >
                                                    <span className="flex items-center"><ImageIcon size={16} className="mr-2 opacity-50" /> {PAPERS[key].name}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={downloadSheet}
                                            className="w-full bg-[#ff6b35] text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-[#e55a2b] transition-all shadow-lg hover:shadow-orange-500/25 active:scale-95"
                                        >
                                            <Download className="mr-2" /> Download Printable Sheet
                                        </button>
                                        <p className="text-xs text-center text-gray-400 mt-2">High Quality JPG • 300 DPI</p>
                                    </div>

                                    {/* The Sheet Preview */}
                                    <div className="bg-gray-200 rounded-xl p-4 flex items-center justify-center overflow-hidden border border-gray-300 relative">
                                        <div className="bg-white shadow-xl relative transition-all duration-500"
                                            style={{
                                                aspectRatio: `${PAPERS[paper].widthMm}/${PAPERS[paper].heightMm}`,
                                                width: '100%',
                                                maxHeight: '400px'
                                            }}
                                        >
                                            {/* Simulated Grid for Preview Only */}
                                            {(() => {
                                                const p = PAPERS[paper];
                                                const s = activeStandard;
                                                const cols = Math.floor(p.widthMm / (s.widthMm + 2));
                                                const rows = Math.floor(p.heightMm / (s.heightMm + 2));
                                                // Create array
                                                const grid = Array(Math.min(30, cols * rows)).fill(0); // Cap at 30 for preview DOM perf

                                                return (
                                                    <div className="w-full h-full p-4 flex flex-wrap content-center justify-center gap-1 bg-white">
                                                        {grid.map((_, i) => (
                                                            <img key={i} src={processedImage} className="object-cover shadow-sm border border-gray-100"
                                                                style={{
                                                                    width: `${(s.widthMm / p.widthMm) * 100}%`,
                                                                    aspectRatio: `${s.widthMm}/${s.heightMm}`
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {!processedImage && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                                <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                                <p>Upload and adjust your photo to see the print preview.</p>
                            </div>
                        )}

                    </div>

                </div>
            </div>
            {/* Hidden Canvas Worker */}
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
}
