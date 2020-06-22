import React, { useState, useEffect } from 'react';
import { Subject, from, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, mergeMap, tap, filter } from 'rxjs/operators';

import { Link } from 'react-router-dom';

import axios from 'axios';

// service
const getNoteByID = async (id) => {
  console.log("get all notes")
  var result = await axios.get(`http://localhost:8080/notes/${id}`)
  return result.data
}

const updateNote = ({id, data}) => {
  // TODO: ここrxjsのajaxでいい気がしてきた
  // TODO: api call. PUT /notes/:id
  // console.log(id, data)
  // console.log("title: ")
  var result = axios.put(`http://localhost:8080/notes/${id}`, data)
  console.log("auto save.")
  let obj = {
    title: data.title,
    author: data.author,
    body: data.body
  }
  return of(obj)
}

// subject
let autoSaveSubject = new Subject()

// これをsubscribeすると、autoUpdateの結果を参照することができる。
// ちな、結果はjsonオブジェクトで帰ってくる
let autoSaveObservable = autoSaveSubject.pipe(
  debounceTime(2000), // since stop typing
  distinctUntilChanged(),
  mergeMap(val => from(updateNote(val)))
)

const useObservable = (observable, setter) => {
  useEffect(() => {
    let subscription = observable.subscribe(result => setter(result))
    return () => subscription.unsubscribe()
  }, [observable, setter])
}

const LiveEditor = (props) => {
  const [init, setInit] = useState(false);
  const [formValue, setFormValue] = useState({
    title: '',
    author: '',
    body: '',
  })
  // let fetchObservable = from(getNoteByID(props.id))
  useEffect(() => {
    // create 
    console.log(props.id)

    // update...
    let subscription = from(getNoteByID(props.id))
      .subscribe(result => {
        if (typeof result !== "undefined") {
          setFormValue({title: result.title, author: result.author, body: result.body})
        }
      })
    if (!init) {
      subscription.next()
      setInit(true)
    }
    return () => subscription.unsubscribe()
  }, [])

  const [result, setResult] = useState({});

  // useObservable(fetchObservable, set)
  useObservable(autoSaveObservable, setResult)

  const handleTitleChange = e => {
    setFormValue({
      ...formValue,
      title: e.target.value
    })
    autoSaveSubject.next({id: props.id, data: formValue})
  }

  const handleAuthorChange = e => {
    setFormValue({
      ...formValue,
      author: e.target.value
    })
    autoSaveSubject.next({id: props.id, data: formValue})
  }

  const handleBodyChange = e => {
    setFormValue({
      ...formValue,
      body: e.target.value
    })
    autoSaveSubject.next({id: props.id, data: formValue})
  }

  const handleFormSubmit = e => {
    e.preventDefault()
    updateNote({ id: props.id, data: formValue })
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div class="live-editor">
        <div>
          <Link to="/">back</Link>
          <button type="submit">save</button>
        </div>
        {/* END buttons */}
        <div>
          <div>
            <input type="text" placeholder="title" value={formValue.title} onChange={handleTitleChange} size="40" />
          </div>
          <div>
            <input type="text" placeholder="author" value={formValue.author} onChange={handleAuthorChange} size="40" />
          </div>
        </div>
        {/* END title and author */}
        <div class="body">
          <div class="editor">
            <textarea onChange={handleBodyChange} value={formValue.body}></textarea>
          </div>

          <div class="preview">
            {/* TODO: parse markdown */}
            {formValue.body}
          </div>
        </div>
        {/* END BODY */}
      </div>
    </form>
  )
}

export default LiveEditor