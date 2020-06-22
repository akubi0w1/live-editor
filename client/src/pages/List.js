import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { from } from 'rxjs';

const getAllNotes = async () => {
  var result = await axios.get("http://localhost:8080/notes")
  return result.data.notes
}

let fetchObservable = from(getAllNotes());

const useObservable = (observable, setter) => {
  useEffect(() => {
    let subscription = observable.subscribe(result => setter(result))
    return () => subscription.unsubscribe()
  }, [observable, setter])
}

const NoteList = () => {
  const [notes, setNotes] = useState([]);

  useObservable(fetchObservable, setNotes)

  return (
    <div style={{margin: "20px"}}>
      <Link to="/create">NewNote</Link>

      {
        notes.map(note => (
          <div key={note.id}><Link to={`/edit/${note.id}`}>{note.title}</Link></div>
        ))
      }
    </div>
  )
}

export default NoteList