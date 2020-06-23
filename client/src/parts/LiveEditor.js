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

const updateNote = async ({id, data, setMessage}) => {
  // TODO: ここrxjsのajaxでいい気がしてきた
  // TODO: api call. PUT /notes/:id
  var result = await axios.put(`http://localhost:8080/notes/${id}`, data)
  let obj = {
    title: data.title,
    author: data.author,
    body: data.body
  }
  setMessage(`auto save: ${result.data.updatedAt}`)
  return of(obj)
}

// subject
let autoSaveSubject = new Subject()

// これをsubscribeすると、autoUpdateの結果を参照することができる。
// ちな、結果はjsonオブジェクトで帰ってくる
let autoSaveObservable = autoSaveSubject.pipe(
  debounceTime(1000), // since stop typing
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
  const [message, setMessage] = useState('no message');
  const [formValue, setFormValue] = useState({
    title: '',
    author: '',
    body: '',
  })
  // let fetchObservable = from(getNoteByID(props.id))
  useEffect(() => {
    // 初期化
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

  const handleChange = e => {
    setFormValue({
      ...formValue,
      [e.target.name]: e.target.value
    })
    autoSaveSubject.next({ id: props.id, data: formValue, setMessage: setMessage })
  }

  const handleFormSubmit = e => {
    e.preventDefault()
    updateNote({ id: props.id, data: formValue, setMessage: setMessage })
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="live-editor">
        <div className="notify" style={{marginBottom: "10px"}}>{message}</div>
        <div style={{margin: "10px"}}>
          <Link to="/" className="btn btn-secondary">back</Link>
          <button type="submit" className="btn btn-primary ml-10">save</button>
        </div>
        {/* END buttons */}
        <table>
          <tbody>
            <tr>
              <td><label>Title</label></td>
              <td><input type="text" name="title" placeholder="title" value={formValue.title} onChange={handleChange} size="40" /></td>
            </tr>
            <tr>
              <td><label>Author</label></td>
              <td><input type="text" name="author" placeholder="author" value={formValue.author} onChange={handleChange} size="40" /></td>
            </tr>
          </tbody>
        </table>
        {/* END title and author */}
        <div class="body">
          <div class="editor">
            <textarea name="body" onChange={handleChange} value={formValue.body}></textarea>
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