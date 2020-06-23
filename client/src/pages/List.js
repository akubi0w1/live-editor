import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { from, Subject, BehaviorSubject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

// service
const getAllNotes = async () => {
  var result = await axios.get("http://localhost:8080/notes")
  return result.data.notes
}

const deleteNoteByID = async (id) => {
  return await axios.delete(`http://localhost:8080/notes/${id}`)
}

let fetchSubject = new BehaviorSubject('');
let fetchObservable = fetchSubject.pipe(
  mergeMap(() => from(getAllNotes()))
)
// let fetchObservable = from(getAllNotes());

const useObservable = (observable, setter) => {
  useEffect(() => {
    console.log("load!")
    let subscription = observable.subscribe(result => setter(result))
    return () => subscription.unsubscribe()
  }, [observable, setter])
}

const NoteList = () => {
  const [notes, setNotes] = useState([]);

  useObservable(fetchObservable, setNotes)

  const handleDeleteNote = e => {
    deleteNoteByID(e.target.value)
    setNotes(notes.filter(note => note.id !== e.target.value))
    fetchSubject.next();
  }

  return (
    <div style={{margin: "20px"}}>
      <div className="mb-10">
        <Link to="/create" className="btn btn-primary">NewNote</Link>
      </div>
      <hr/>
      <div className="notes-list">
        <h3>NoteList</h3>
        <table>
          {
            notes
              ? notes.map(note => (
                <tr key={note.id} style={{lineHeight: "2em"}}>
                  <td><Link to={`/edit/${note.id}`} className="note-link">{note.title}</Link></td>
                  <td><button className="btn btn-secondary" onClick={handleDeleteNote} value={note.id}>delete</button></td>
                </tr>
              ))
              : <div>loading...</div>
          }
        </table>
      </div>
    </div>
  )
}

export default NoteList