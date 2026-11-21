// SweetAlert2 dimuat saat pertama kali dibutuhkan agar tidak membebani muat awal halaman
const loadSwal = () => import('sweetalert2').then((module) => module.default)

export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function showErrorAlert(message, title = 'Terjadi Kesalahan') {
  const Swal = await loadSwal()
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#4f46e5',
  })
}

export async function showSuccessAlert(message, title = 'Berhasil!') {
  const Swal = await loadSwal()
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: '#4f46e5',
  })
}

export async function showConfirmDialog(message, title = 'Konfirmasi') {
  const Swal = await loadSwal()
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
  }).then((result) => result.isConfirmed)
}
