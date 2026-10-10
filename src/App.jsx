import Layout from './components/Layout.jsx'
import Preloader from './components/Preloader.jsx'

// `Page` is the page that was opened (lib/route.js).
export default function App({ Page }) {
  return (
    <>
      <Preloader />
      <Layout>
        <Page />
      </Layout>
    </>
  )
}
