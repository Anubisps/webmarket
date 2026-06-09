import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import jsPDF from 'jspdf'

// Dynamically import autotable to ensure it's loaded
async function getPdfWithAutoTable() {
  const { default: autoTable } = await import('jspdf-autotable')
  return autoTable
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const doc = new jsPDF()
    const autoTable = await getPdfWithAutoTable()

    // ✅ Header
    doc.setFillColor(60, 30, 80) // Dark purple
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text('WindVault Market', 20, 25)
    doc.setFontSize(12)
    doc.text('Invoice', 20, 35)

    // ✅ Order details
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`Order #${order.id.slice(0,8)}`, 150, 50)
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 150, 56)
    doc.text(`Customer: ${order.user.username} (${order.user.email})`, 150, 62)

    // ✅ Items table using dynamic autoTable
    const tableData = order.items.map((item: any) => [
      item.product.name,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ])

    autoTable(doc, {
      head: [['Product', 'Qty', 'Price', 'Total']],
      body: tableData,
      startY: 70,
      headStyles: {
        fillColor: [100, 50, 150],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 }
      }
    })

    const finalY = (doc as any).lastAutoTable?.finalY || 150

    // ✅ Summary
    doc.setFontSize(12)
    doc.text(`Subtotal: $${order.total.toFixed(2)}`, 150, finalY + 10)
    if (order.discountAmount) {
      doc.text(`Discount: -$${order.discountAmount.toFixed(2)}`, 150, finalY + 18)
      doc.text(`Total: $${(order.total - order.discountAmount).toFixed(2)}`, 150, finalY + 26)
    } else {
      doc.text(`Total: $${order.total.toFixed(2)}`, 150, finalY + 18)
    }

    // ✅ Footer
    doc.setFillColor(240, 240, 240)
    doc.rect(0, 280, 210, 20, 'F')
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text('WindVault Market - Premium Gaming Marketplace', 20, 290)
    doc.text('Thank you for your purchase!', 20, 296)

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id.slice(0,8)}.pdf"`
      }
    })
  } catch (error) {
    console.error('Invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
