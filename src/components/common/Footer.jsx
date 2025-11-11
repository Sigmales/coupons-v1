export default function Footer() {
  return (
    <footer className="bg-white border-t border-primary-100">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-primary-800">
        © {new Date().getFullYear()} Coupons — Tous droits réservés.
      </div>
    </footer>
  )
}

