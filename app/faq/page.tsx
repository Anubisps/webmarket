export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2">How do I purchase an item?</h3>
          <p className="text-gray-600">Browse products, add to cart, and checkout using crypto or other enabled payment methods.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Is my payment secure?</h3>
          <p className="text-gray-600">Yes – all transactions are encrypted and fraud‑protected.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">How long does delivery take?</h3>
          <p className="text-gray-600">Most items are delivered instantly after payment confirmation.</p>
        </div>
      </div>
    </div>
  )
}
