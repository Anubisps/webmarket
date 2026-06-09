import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Type declaration for autoTable (optional, but helps with TypeScript)
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: { finalY: number };
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
    doc.text('WindVault Market - Invoice', 20, 20)
    doc.text(`Order #${order.id.slice(0,8)}`, 20, 30)
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 20, 40)
    doc.text(`Customer: ${order.user.username} (${order.user.email})`, 20, 50)

    const tableData = order.items.map((item: any) => [
      item.product.name,
      item.quantity,
      item.price.toFixed(2),
      (item.quantity * item.price).toFixed(2)
    ])

    // Use (doc as any) to bypass TypeScript checking for autoTable
    ;(doc as any).autoTable({
      head: [['Product', 'Qty', 'Price', 'Total']],
      body: tableData,
      startY: 60
    })

    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.text(`Subtotal: $${order.total.toFixed(2)}`, 20, finalY)
    if (order.discountAmount) {
      doc.text(`Discount: -$${order.discountAmount.toFixed(2)}`, 20, finalY + 10)
      doc.text(`Final Total: $${(order.total - order.discountAmount).toFixed(2)}`, 20, finalY + 20)
    }

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
