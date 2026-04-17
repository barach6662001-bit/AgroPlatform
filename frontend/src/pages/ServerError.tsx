import { ErrorPage } from '@/components/error/error-page'
export default function ServerError() {
  return (
    <ErrorPage
      code="500"
      primaryAction={{ label: 'Reload page', onClick: () => window.location.reload() }}
    />
  )
}
