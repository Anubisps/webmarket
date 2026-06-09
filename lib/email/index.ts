import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(order: any, user: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'WindVault Market <orders@windvault.store>',
      to: [user.email],
      subject: `Order Confirmation #${order.id.slice(0,8)}`,
      html: `
        <h1>Thank you for your order, ${user.username}!</h1>
        <p><strong>Order ID:</strong> #${order.id.slice(0,8)}</p>
        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${order.items.map((item: any) => `
            <li>${item.product.name} × ${item.quantity} – $${item.price.toFixed(2)}</li>
          `).join('')}
        </ul>
        ${order.discountAmount ? `<p><strong>Discount Applied:</strong> -$${order.discountAmount.toFixed(2)}</p>` : ''}
        <p><strong>Status:</strong> ${order.status}</p>
        <p><a href="https://windvault.store/dashboard/orders/${order.id}">View Order Details</a></p>
      `
    })

    if (error) {
      console.error('Email error:', error)
    }
  } catch (err) {
    console.error('Failed to send email:', err)
  }
}
