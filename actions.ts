import api from 'services/axios';
import {dispatch} from 'app-redux/configureStore';

export function crudActions<T>(url: (() => string) | string , actionTypes: any, normalizeData ? : (data : any)=>void ){

  const getUrl = ()=>{
    if(typeof url == "string") return url;
    else return url();
  }

  const getAction = async (id : string | number | null = null, params = '') => {
    if(id){
      try {
        dispatch({type: actionTypes.GET});
        const response = await api.get<void>(`${getUrl()}/${id}?${params}`);
        let data = response.data;
        if (normalizeData) data = normalizeData(data);
        dispatch({type: actionTypes.GET_SUCCESS, payload: data});
        return data;
      }
      catch(error : any){
        dispatch({ type: actionTypes.GET_ERROR,payload: error.message,});
        return error;
      }
    }
    else{
      try {
        dispatch({type: actionTypes.GET_LIST});
        const response = await api.get<void>(`${getUrl()}?${params}`);
        const data = response.data;
        dispatch({type: actionTypes.GET_LIST_SUCCESS, payload: response});
        return data;
      }
      catch(error : any){
        dispatch({type: actionTypes.GET_LIST_ERROR,payload: error.message,});
        return error;
      }
    }
  };

  const deleteAction = async (id : number) => {
    try {
      dispatch({type: actionTypes.DELETE});
      const response = await api.delete<any>(`${getUrl()}/${id}`);
      dispatch({type: actionTypes.DELETE_SUCCESS});
      return;
    }
    catch(error : any) {
      dispatch({type: actionTypes.DELETE_ERROR,payload: error.message });
      return error;
    }
  };

  const postAction = async (form: T ) => {
    try {
      dispatch({type: actionTypes.ADD});
      /*
      NEW
      Add, {...form, cookies: null}
      Add, ?is_duplicate=true to url of request
      */
      const response = await api.post<any>(`${getUrl()}?is_duplicate=true`, {...form, cookies: null});
      const data = response.data;
      dispatch({type: actionTypes.ADD_SUCCESS, payload: data});
      return data;
    }
    catch(error : any){
      dispatch({ type: actionTypes.ADD_ERROR,payload: error.message, });
      throw error;
    }
  };

  const putAction = async (form: T | any) => {
    try {
      dispatch({type: actionTypes.UPDATE});
      const id = form.id;
      const response = await api.put<any>(`${getUrl()}/${id}`, {...form});
      const data = response.data;
      dispatch({type: actionTypes.UPDATE_SUCCESS, payload: data});
      return data;
    }
    catch(error : any){
      dispatch({ type: actionTypes.UPDATE_ERROR ,payload: error.message,});
      throw error;
    }
  };

  const submitAction = (form : any) => {
    if(form.id) {
      return putAction(form)
    } else {
      return postAction(form)
    }
  };


  return {
    get: getAction,
    delete : deleteAction,
    submit : submitAction,
  };

};
