import React, { useState } from 'react'
import hints from './../configs/hints';

function Hints({
  HintsOn,
  setHintsOn
}) {
 

  const handleClose = () => {
    setHintsOn(false)
  }

  if (!HintsOn) return null

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50'>
      <div className='fixed inset-0 bg-black opacity-50 backdrop-blur-sm'></div>
      
      <div className='rounded-xl p-6 shadow-2xl border-2 border-white bg-gray-900 max-h-[80vh] w-screen max-w-3xl relative z-10'>
        <button 
          onClick={handleClose}
          className='absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1'
          aria-label="Close hints"
        >
          <div className="relative w-5 h-5 mt-2">
           X
          </div>
        </button>
        
        <h2 className='text-2xl font-bold mb-4 text-white'>Hints</h2>
        
        <div className='flex flex-col gap-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2'>
         {hints.map((hint, index) => (
            <div key={index} className='bg-gray-800 p-4 rounded-lg shadow-md'>
              {hint.text!==""&&<h3 className='text-lg font-semibold text-white mb-5'>{hint.text}</h3>}
             {hint.url && <img src={hint.url} alt="hint" className=' max-w-[300px]'/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hints