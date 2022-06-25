import {Outlet, Navigate} from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

const RutaProteginda = () => {
  const {auth,cargando} = useAuth()
  
  if(cargando) return 'Cargando...'
  return (
    <>
      {auth._id ? (
        <div>
          <Header/>
          <div className='md:flex md:min-h-screen'>
            <Sidebar/>
            <main className='p-10 flex-1'>
              <Outlet/> 
            </main>
          </div>
        </div>
      )
      
      : <Navigate to ="/"/>}
    </>
  )
}

export default RutaProteginda