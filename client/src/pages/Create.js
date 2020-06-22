import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { from } from 'rxjs';


const createNote = async () => {
  // api call. POST /notes
  var result = await axios.post(`http://localhost:8080/notes`, {
    title: '',
    author: '',
    body: ''
  })
  return result.data.id
}

const Create = () => {
  const [id, setID] = useState('');

  useEffect(() => {
    let subscription = from(createNote()).subscribe(res => setID(res))
    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      {
        id 
          ? <Redirect to={`/edit/${id}`} />
          : <></>
      }
    </>
  )
}

export default Create