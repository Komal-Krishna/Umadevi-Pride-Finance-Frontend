import ChitDetails from '@/components/ChitDetails'
import Layout from '@/components/Layout'

interface ChitPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ChitPage({ params }: ChitPageProps) {
  const { id } = await params
  
  return (
    <Layout title="Chit Details">
      <ChitDetails chitId={parseInt(id)} />
    </Layout>
  )
}
