import Swal from 'sweetalert2';

// Custom theme matching Digital Comrade design
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

export const showSuccess = (message: string, title = 'Success') => {
    return Swal.fire({
        icon: 'success',
        title,
        text: message,
        confirmButtonColor: '#01478c',
    });
};

export const showError = (message: string, title = 'Error') => {
    return Swal.fire({
        icon: 'error',
        title,
        text: message,
        confirmButtonColor: '#01478c',
    });
};

export const showWarning = (message: string, title = 'Warning') => {
    return Swal.fire({
        icon: 'warning',
        title,
        text: message,
        confirmButtonColor: '#01478c',
    });
};

export const showInfo = (message: string, title = 'Info') => {
    return Swal.fire({
        icon: 'info',
        title,
        text: message,
        confirmButtonColor: '#01478c',
    });
};

export const showConfirm = async (
    message: string,
    title = 'Are you sure?',
    confirmText = 'Yes',
    cancelText = 'Cancel'
): Promise<boolean> => {
    const result = await Swal.fire({
        icon: 'warning',
        title,
        text: message,
        showCancelButton: true,
        confirmButtonColor: '#01478c',
        cancelButtonColor: '#6b7280',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
    });
    return result.isConfirmed;
};

export const showDeleteConfirm = async (itemName = 'this item'): Promise<boolean> => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Delete Confirmation',
        text: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
    });
    return result.isConfirmed;
};

export const showToast = {
    success: (message: string) => Toast.fire({ icon: 'success', title: message }),
    error: (message: string) => Toast.fire({ icon: 'error', title: message }),
    warning: (message: string) => Toast.fire({ icon: 'warning', title: message }),
    info: (message: string) => Toast.fire({ icon: 'info', title: message }),
};

export const showLoading = (title = 'Please wait...') => {
    Swal.fire({
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

export const closeLoading = () => {
    Swal.close();
};

export default Swal;
