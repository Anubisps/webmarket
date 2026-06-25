import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import jsPDF from 'jspdf'
import { formatPriceLabel } from '@/lib/formatPrice'

async function getPdfWithAutoTable() {
  const { default: autoTable } = await import('jspdf-autotable')
  return autoTable
}

function formatMoney(value: number) {
  return formatPriceLabel(value)
}

function paymentStatusLabel(status: string) {
  switch (status) {
    case 'paid': return 'PAID'
    case 'failed': return 'FAILED'
    case 'refunded': return 'REFUNDED'
    default: return 'PENDING PAYMENT'
  }
}

function orderStatusLabel(status: string) {
  switch (status) {
    case 'completed': return 'COMPLETED'
    case 'cancelled': return 'CANCELLED'
    case 'disputed': return 'DISPUTED'
    default: return 'PROCESSING'
  }
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
            product: {
              include: { category: true }
            }
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
    const pageWidth = doc.internal.pageSize.getWidth()

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = order.discountAmount || 0
    const grandTotal = Math.max(subtotal - discount, 0)
    const paymentLabel = paymentStatusLabel(order.paymentStatus)
    const orderLabel = orderStatusLabel(order.status)
    const isPaid = order.paymentStatus === 'paid'

    // Header band
    doc.setFillColor(88, 28, 135)
    doc.rect(0, 0, pageWidth, 48, 'F')
    doc.setFillColor(219, 39, 119)
    doc.rect(pageWidth - 70, 0, 70, 48, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('WindVault Market', 16, 22)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Official Purchase Invoice', 16, 32)
    doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, pageWidth - 58, 22)
    doc.text(new Date(order.createdAt).toLocaleString(), pageWidth - 58, 32)

    // Status badges
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    const paymentColor = isPaid ? [16, 185, 129] : [245, 158, 11]
    doc.setFillColor(paymentColor[0], paymentColor[1], paymentColor[2])
    doc.roundedRect(16, 56, 42, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text(paymentLabel, 20, 63)

    doc.setFillColor(59, 130, 246)
    doc.roundedRect(62, 56, 38, 10, 2, 2, 'F')
    doc.text(orderLabel, 66, 63)

    // Customer + order info
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Bill To', 16, 82)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(order.user.username, 16, 90)
    doc.text(order.user.email, 16, 96)
    if (order.contactEmail) doc.text(`Contact: ${order.contactEmail}`, 16, 102)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Order Details', 115, 82)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Order ID: ${order.id}`, 115, 90)
    doc.text(`Payment Method: ${order.paymentMethod || 'N/A'}`, 115, 96)
    doc.text(`Payment Status: ${paymentLabel}`, 115, 102)
    doc.text(`Order Status: ${orderLabel}`, 115, 108)

    // Game ID block
    let nextY = 118
    if (order.ign || order.ignUsername) {
      doc.setFillColor(245, 243, 255)
      doc.roundedRect(16, nextY, pageWidth - 32, 22, 3, 3, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(88, 28, 135)
      doc.text('Delivery Information', 22, nextY + 8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(40, 40, 40)
      doc.text(`Game ID: ${order.ign || 'N/A'}`, 22, nextY + 15)
      doc.text(`In-Game Username: ${order.ignUsername || 'Not fetched'}`, 90, nextY + 15)
      nextY += 30
    }

    const tableData = order.items.map((item) => [
      item.product.name,
      item.product.category?.name || 'General',
      String(item.quantity),
      formatMoney(item.price),
      formatMoney(item.quantity * item.price),
    ])

    autoTable(doc, {
      head: [['Product', 'Category', 'Qty', 'Unit Price', 'Line Total']],
      body: tableData,
      startY: nextY,
      theme: 'grid',
      headStyles: {
        fillColor: [88, 28, 135],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 58 },
        1: { cellWidth: 38 },
        2: { cellWidth: 14, halign: 'center' },
        3: { cellWidth: 32, halign: 'right' },
        4: { cellWidth: 32, halign: 'right' },
      },
    })

    const finalY = (doc as any).lastAutoTable?.finalY || nextY + 40

    doc.setDrawColor(220, 220, 220)
    doc.line(120, finalY + 8, pageWidth - 16, finalY + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text('Subtotal', 130, finalY + 16)
    doc.text(formatMoney(subtotal), pageWidth - 18, finalY + 16, { align: 'right' })

    if (discount > 0) {
      doc.setTextColor(16, 120, 80)
      doc.text('Discount', 130, finalY + 24)
      doc.text(`-${formatMoney(discount)}`, pageWidth - 18, finalY + 24, { align: 'right' })
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(88, 28, 135)
    doc.text('Grand Total', 130, finalY + (discount > 0 ? 34 : 26))
    doc.text(formatMoney(grandTotal), pageWidth - 18, finalY + (discount > 0 ? 34 : 26), { align: 'right' })

    if (!isPaid) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(180, 83, 9)
      doc.text(
        'Payment is pending. If you paid manually, contact support via Live Chat or a Support Ticket with your proof of payment.',
        16,
        finalY + 48,
        { maxWidth: pageWidth - 32 }
      )
    }

    if (order.staffNote) {
      doc.setFillColor(239, 246, 255)
      doc.roundedRect(16, finalY + 56, pageWidth - 32, 18, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(37, 99, 235)
      doc.text('Staff Note', 22, finalY + 64)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(40, 40, 40)
      doc.text(order.staffNote, 22, finalY + 70, { maxWidth: pageWidth - 44 })
    }

    // Footer
    doc.setFillColor(20, 20, 30)
    doc.rect(0, 275, pageWidth, 22, 'F')
    doc.setTextColor(200, 200, 210)
    doc.setFontSize(8)
    doc.text('WindVault Market • Premium Gaming Marketplace • windvault.store', 16, 284)
    doc.text('Thank you for your purchase. Need help? Use Live Chat or open a support ticket.', 16, 290)

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="WindVault-Invoice-${order.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
