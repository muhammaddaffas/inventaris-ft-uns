"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (<html><body style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><p style={{fontSize:"2rem",fontWeight:"900"}}>Error</p><button onClick={reset} style={{marginTop:"1rem",padding:"8px 16px",background:"#1B4DB3",color:"white",borderRadius:"8px",border:"none",cursor:"pointer"}}>Muat Ulang</button></div></body></html>);
}
