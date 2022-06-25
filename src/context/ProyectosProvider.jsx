
import {useState, useEffect, createContext} from 'react'
import clienteAxios from '../config/clienteAxios'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'


const ProyectosContext = createContext()

const ProyectosProvider = ({children}) => {

  const [proyectos, setProyectos] =useState([])
  const [proyecto, setProyecto] =useState({})
  const [alerta, setAlerta] = useState({})
  const [cargando, setCargando] = useState(false)
  const [modalFormularioTarea , setModalFormularioTarea] = useState(false)
  const [tarea, setTarea] = useState({})
  const [modalEliminarTarea, setModalEliminarTarea] = useState(false)
  const [colaborador, setColaborador] = useState({})
  const [modalEliminarColaborador , setModalEliminarColaborador] = useState(false)

  const navigate = useNavigate()
  const {auth} = useAuth()

  useEffect(() => {
    const obtenerProyectos  = async () => {
      try {

        const token = localStorage.getItem('token')
        if(!token) return

        const config = {
          headers: {
            "Content-Type" :"application/json",
            Authorization : `Bearer ${token}`
          }
          
        }

        const {data} = await clienteAxios.get('/proyectos', config)
        setProyectos(data)
      } catch (error) {
        console.log(error)
      }
    }

    obtenerProyectos()

  }, [auth])

  const mostrarAlerta  = (alerta) => {

    setAlerta(alerta)

    setTimeout(() => {
      setAlerta({})
    }, 5000)

  }

  const submitProyecto = async (proyecto) => {

    if(proyecto.id){
      await editarProyecto(proyecto)
    }else{
      await nuevoProyecto(proyecto)
    }
        
  }

  const editarProyecto = async (proyecto) => {

    const token = localStorage.getItem('token')

    try {

      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }  
      }

      const {data} = await clienteAxios.put(`/proyectos/${proyecto.id}`, proyecto, config)

      // Sincronizar el state
      const proyectosActualizado = proyectos.map(proyectoState => proyectoState._id === data._id ? data : proyectoState)
      setProyectos(proyectosActualizado)

      mostrarAlerta({
        msg: 'Proyecto Actualizado correctamente',
        error: false
      })

      setTimeout(() => {
        setAlerta({})
        navigate('/proyectos')
      }, 3000)

      
    } catch (error) {
      console.log(error)
    }    
  }

  const nuevoProyecto = async (proyecto) => {
    try {
      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
        
      }

      const {data} = await clienteAxios.post('/proyectos', proyecto, config)
      setProyectos([...proyectos, data])

      mostrarAlerta({
        msg: 'Proyecto creado correctamente',
        error: false
      })

      setTimeout(() => {
        setAlerta({})
        navigate('/proyectos')
      }, 3000)
    
    } catch (error) {
      console.log(error)
    }
  }

  const obtenerProyecto = async (id) =>  {
    setCargando(true)
    try {
      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
      }
      const {data} = await clienteAxios(`/proyectos/${id}`, config)
      setProyecto(data)
      setAlerta({})
  
    } catch (error) {
      navigate('/proyectos')
      setAlerta({
        msg: error.response.data.msg,
        error:true
      })
      setTimeout(() => {
        setAlerta({})
      },3000)
    } finally{
      setCargando(false)
    }
  }

  const eliminarProyecto = async (id) => {
    try {
      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
      }

      const {data} = await clienteAxios.delete(`/proyectos/${id}`, config)

      // Sincronizar el state
      const proyectosActualizado = proyectos.filter(proyectoState => proyectoState._id !== id)
      setProyectos(proyectosActualizado)

      setAlerta({
        msg: data.msg,
        error: false
      })

      setTimeout(() => {
        setAlerta({})
        navigate('/proyectos')
      }, 3000)

    } catch (error) {
      console.log(error)
    }
  }

  const handleModalTarea = () => {
    setModalFormularioTarea(!modalFormularioTarea)
    setTarea({})
  }

  const submitTarea = async tarea => {

    if(tarea?.id){
      await editarTarea(tarea)
    }else{
      await crearTarea(tarea)
    }

  }

  const crearTarea = async tarea =>  {
    
    try {
      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
      }

      const {data} = await clienteAxios.post(`/tareas`, tarea, config)

     // Agrega la tarea al state
      
      setAlerta({})
      setModalFormularioTarea(false)

      // SOCKET IO
      submitTareasProyectos(data)
      
    } catch (error) {
      console.log(error)      
    }
  }

  const editarTarea = async tarea => {
    try {
      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
      }

      const {data} = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, config)
     
      setAlerta({})
      setModalFormularioTarea(false)

      // SOCKET
      actualizarTareaProyecto(data)

    } catch (error) {
      console.log(error)      
    }
  }

  const handleModalEditarTarea = tarea => {
    setTarea(tarea)
    setModalFormularioTarea(true)
  }

  const handleModalEliminarTarea = tarea => {
    setTarea(tarea)
    setModalEliminarTarea(!modalEliminarTarea)
  }

  const eliminarTarea = async () => {
    try {

      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
      }

      const {data} = await clienteAxios.delete(`/tareas/${tarea._id}`, config)
      setAlerta({
        msg: data.msg,
        error: false
      })
      
          
      setModalEliminarTarea(false)
      
      // SCOKET
      eliminarTareaProyecto(data)
      
    } catch (error) {
      console.log(error.response.data.msg)
    }
  }

  const submitColaborador = async (email) => {
    setCargando(true)
    try {
      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
      }

      const {data} = await clienteAxios.post('proyectos/colaboradores', {email}, config)
      setColaborador(data)
      setAlerta({})      
    } catch (error) {
      setAlerta({
        msg: error.response.data.msg,
        error: true
      })    
    } finally {
      setCargando(false)
    }
  }

  const agregarColaborado = async (email) => {
    try {
      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
      }

      const {data} = await clienteAxios.post(`proyectos/colaboradores/${proyecto._id}`, email, config)

      setAlerta({
        msg : data.msg,
        error: false
      })
      
      setColaborador({})
      setTimeout(() => {
        setAlerta({})
      },3000)

    } catch (error) {

      setAlerta({
        msg : error.response.data.msg,
        error: true
      })
      
    }
  }

  const handleModalEliminarColaborador = (colaborador) => {
    setModalEliminarColaborador(!modalEliminarColaborador)
    setColaborador(colaborador)
  }

  const eliminarColaborador = async () => {
    try {

      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
      }

      const {data} = await clienteAxios.post(`proyectos/eliminar-colaborador/${proyecto._id}`, {id: colaborador._id}, config)

      const proyectoActualizado = {...proyecto}
      proyectoActualizado.colaboradores = proyectoActualizado.colaboradores.filter(colaboradorState => colaboradorState._id !== colaborador._id)

      setProyecto(proyectoActualizado)
      setAlerta({
        msg: data.msg,
        error: false
      })

      setModalEliminarColaborador(false)
      setColaborador({})

      setTimeout(() => {
        setAlerta({})
      },3000)
      
    } catch (error) {
      console.log(error.response)
    }
  }

  const completarTarea = async id => {
    try {
      const token = localStorage.getItem('token')
      if(!token) return

      const config = {
        headers: {
          "Content-Type" :"application/json",
          Authorization : `Bearer ${token}`
        }
      }
      const {data} = await clienteAxios.post(`/tareas/estado/${id}`, {}, config)

      setTarea({})
      setAlerta({})
      
      // SOCKET
      cambiarEstadoTarea(data)
      
    } catch (error) {
      console.log(error.response)      
    }
  }


  // Socket io
  const submitTareasProyectos = (tarea) => {
    const proyectoActualizado = {...proyecto}
    proyectoActualizado.tareas = [...proyectoActualizado.tareas, tarea]
    setProyecto(proyectoActualizado)
  }

  const eliminarTareaProyecto = (tarea) => {
    const proyectoActualizado = {...proyecto}
    proyectoActualizado.tareas = proyecto.tareas.filter(tareaState => tareaState._id !== tarea.id)
    setProyecto(proyectoActualizado)
  }

  const actualizarTareaProyecto = tarea => {
    const proyectoActualizado = {...proyecto}
    proyectoActualizado.tareas = proyecto.tareas.map(tareaState => tareaState._id === tarea._id ? tarea : tareaState)
    setProyecto(proyectoActualizado)
  }

  const cambiarEstadoTarea = tarea => {
    const proyectoActualizado = {...proyecto}
    proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => tareaState._id === tarea._id ? tarea : tareaState)
    setProyecto(proyectoActualizado)
  }

  const cerrarSesionProyectos = () => {
    setProyectos({})
    setProyecto({})
    setAlerta({})
    
  }

  return(
    <ProyectosContext.Provider
      value={{
        proyectos,
        mostrarAlerta,
        alerta,
        submitProyecto,
        obtenerProyecto,
        proyecto,
        cargando,
        eliminarProyecto,
        handleModalTarea,
        modalFormularioTarea,
        submitTarea,
        handleModalEditarTarea,
        tarea,
        handleModalEliminarTarea,
        modalEliminarTarea,
        eliminarTarea,
        submitColaborador,
        colaborador,
        agregarColaborado,
        handleModalEliminarColaborador,
        modalEliminarColaborador,
        eliminarColaborador,
        completarTarea,
        submitTareasProyectos,
        eliminarTareaProyecto,
        actualizarTareaProyecto,
        cambiarEstadoTarea,
        cerrarSesionProyectos      
      }}
    >
      {children}
    </ProyectosContext.Provider>

  )
}

export {
  ProyectosProvider
}

export default ProyectosContext
