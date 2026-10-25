export function Mole({kind='mole',className=''}:{kind?:string,className?:string}) {
  const body=kind==='pink'?'#b9869b':kind==='garden'?'#b29177':'#8b7b72';
  return <svg className={`mole ${className}`} viewBox="0 0 64 64" fill="none" shapeRendering="crispEdges" aria-hidden="true">
    <path d="M12 28h4V16h8v-4h20v4h8v12h4v24h-4v4H16v-4h-4Z" fill="#31575b"/>
    <path d="M16 30h4V20h8v-4h12v4h8v10h4v18h-4v4H20v-4h-4Z" fill={body}/>
    <path d="M24 34h16v4h8v8h-4v4H24v-4h-4v-8h4Z" fill="#ebc8ac"/>
    <path d="M28 36h12v4H28z" fill="#aa6977"/><path d="M32 42h4v4h-4z" fill="#67565c"/>
    <path d="M8 44h8v8H8zm44 0h8v8h-8z" fill={body}/><path d="M16 54h12v6H12v-4h4zm20 0h12v2h4v4H36z" fill="#31575b"/>
    {kind==='garden'?<><path d="M12 16h44v8H12zm8-8h28v8H20z" fill="#f5d47d"/><path d="M20 16h28v4H20z" fill="#bb8561"/><path d="M24 28h4v6h-4zm16 0h4v6h-4z" fill="#31575b"/><path d="M20 46h28v8H20zm4-4h4v8h-4zm16 0h4v8h-4z" fill="#4eae9f"/><path d="M30 48h8v4h-8z" fill="#b6e5cc"/></>:kind==='pink'?<><path d="M24 26h4v6h-4zm16 0h4v6h-4z" fill="#31575b"/><path d="M36 10h4V2h4v8h8v4H36z" fill="#6cbb91"/><path d="M20 46h28v8H20z" fill="#e8b0b9"/></>:<><path d="M16 26h16v10H20v-4h-4zm20 0h16v6h-4v4H36zm-4 2h4v4h-4z" fill="#25474e"/><path d="M20 28h4v4h-4zm20 0h4v4h-4z" fill="#b0e7e3"/><path d="M20 46h28v6H20zm20 4h8v10h-8z" fill="#f3a187"/></>}
  </svg>;
}
export function Garden({compact=false}:{compact?:boolean}) {
  return <div className={`garden-scene ${compact?'compact':''}`} role="img" aria-label="Turkuaz bir gölet, çiçekler ve bahçede saklanan üç piksel köstebek">
    <svg viewBox="0 0 800 340" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="800" height="340" fill="var(--sky)"/>
      <g fill="#fff" opacity=".8"><path d="M50 55h20V43h46v12h20v15H50zm480-17h22V27h38v11h26v16h-86zm134 58h20V85h32v11h26v13h-78z"/></g>
      <rect x="650" y="30" width="40" height="40" fill="#fff0b8"/><rect x="642" y="38" width="56" height="24" fill="#fff0b8"/>
      <path d="M0 168h45v-20h65v-18h95v20h74v22h90v-30h90v-18h98v27h89v-15h88v20h66v-13h50v197H0Z" fill="var(--hill)"/>
      <path d="M0 202h100v-15h80v18h75v-24h88v23h65v-17h98v20h108v-18h100v15h86v136H0Z" fill="var(--grass)"/>
      <path d="M320 222h50v-16h132v14h44v20h30v38h-24v16H364v-12h-44z" fill="#73ccca"/>
      <path d="M346 228h42v-8h98v12h42v12h24v24h-32v12H380v-12h-34z" fill="#a8e6df"/>
      <path d="M390 240h48v5h-48zm86 20h38v5h-38z" fill="#e3fbef"/>
      <g fill="#d1b18a"><path d="M0 280h225v16h75v44H0zm0-32h80v16H0zm630 70h170v22H630z"/></g>
      <g fill="#b2d994"><path d="M0 320h90v20H0zm160-16h40v12h-40zm430-15h48v15h-48z"/></g>
      <g fill="#70ad80"><path d="M30 220v-12h6v12zm6-6h8v5h-8zm160 45v-12h6v12zm6-7h8v5h-8zm388-42v-12h6v12zm6-6h8v5h-8zm148 64v-14h6v14zm6-8h8v5h-8z"/></g>
      <g fill="#fff2d2"><path d="M96 224h6v6h-6zm6-6h6v6h-6zm6 6h6v6h-6zm-6 6h6v6h-6zm500 50h6v6h-6zm6-6h6v6h-6zm6 6h6v6h-6zm-6 6h6v6h-6z"/></g>
      <g fill="#e99c9f"><path d="M227 207h6v6h-6zm6-6h6v6h-6zm6 6h6v6h-6zm-6 6h6v6h-6zm464 20h6v6h-6zm6-6h6v6h-6zm6 6h6v6h-6zm-6 6h6v6h-6z"/></g>
      <g fill="#e0c69b"><path d="M44 158h8v50h-8zm35 0h8v50h-8zm35 0h8v50h-8zm35 0h8v50h-8z"/><path d="M38 170h126v7H38zm0 20h126v7H38z"/></g>
      <g fill="#6da285"><path d="M714 173v-57h8v57zm-16-26h40v-24h-8v-14h-24v14h-8z"/><path d="M44 320h4v-14h-4zm-5-6h14v4H39zm609 3h4v-14h-4zm-5-6h14v4h-14z"/></g>
      <path d="M250 269h52v8h-52zm288-48h48v8h-48zm-418 11h48v8h-48z" fill="#82b89a"/>
    </svg>
    <Mole kind="garden" className="scene-gardener"/><Mole className="scene-kosto"/><Mole kind="pink" className="scene-friend"/>
    <span className="scene-bubble">Aramızda biri farklı…</span>
    <span className="scene-spark s1">✦</span><span className="scene-spark s2">✧</span>
  </div>;
}
