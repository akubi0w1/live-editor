import React from 'react';
import LiveEditor from '../parts/LiveEditor';

const Editor = (props) => {
  // id = 
  const id = props.match.params.id
  return (
    <div>
      <LiveEditor id={id}/>
    </div>
  )
}

export default Editor