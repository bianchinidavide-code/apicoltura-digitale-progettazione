import React from 'react';

// Assicurati che questi file esistano nella tua cartella src/ o aggiorna i percorsi
import graph2 from "./immagini/graph-2.svg";
import graph from "./immagini/graph.svg";
import home from "./immagini/home.svg";
import icons8FrecciaLungaADestra501 from "./immagini/freccia.png";
import image9 from "./immagini/image-9.png";
import image10 from "./immagini/image-10.png";
import image15 from "./immagini/image-15.png";
{/*import image from "./image.svg";
  import vector2 from "./vector-2.svg";
import vector3 from "./vector-3.svg";
import vector from "./vector.svg";*/}
import line2 from "./immagini/line-2.svg";
import line3 from "./immagini/line-3.svg";
import line4 from "./immagini/line-4.svg";
import line5 from "./immagini/line-5.svg";
import line6 from "./immagini/line-6.svg";
import line from "./immagini/line.svg";
import statusBar from "./immagini/status-bar.svg";


function App() {
  return (
    <div className="bg-white overflow-hidden w-full min-w-[375px] min-h-[812px] relative mx-auto">
      {/* Background Image */}
      <img
        className="absolute top-0 left-0 w-[375px] h-[812px] aspect-[0.51]"
        alt="Sfondo"
        src={image15}
      />

      {/* Status Bar */}
      <img
        className="absolute top-0 left-0 w-[375px] h-11"
        alt="Status bar"
        src={statusBar}
      />

      {/* Immagine Meteo/Icona */}
      <img
        className="absolute top-[342px] left-[73px] w-[70px] h-[70px] aspect-[1] object-cover"
        alt="Meteo icona"
        src={image10}
      />

      {/* Home Indicator (iOS style) */}
      <div className="absolute left-[calc(50%_-_67px)] bottom-2 w-[134px] h-[5px] bg-black rounded-[100px]" />

      {/* Icona Home e Titolo */}
      <div className="absolute top-[735px] left-[calc(50%_-_184px)] w-[76px] h-[43px] flex">
        <img className="mt-3 w-6 h-6 ml-[26px]" alt="Icon home" src={home} />
      </div>

      <div className="absolute top-[713px] left-[calc(50%_-_168px)] w-[337px] h-[94px] flex items-center justify-center font-bold text-black text-2xl text-center tracking-[-0.24px] leading-[25.9px]">
        UMIDITÀ
      </div>

      {/* Card del Grafico */}
      <div className="absolute top-[434px] left-2 w-[360px] h-[282px] bg-[#ffe0ac] rounded-lg overflow-hidden border border-solid border-[#dfdfdf]">
        {/* Linee della griglia */}
        <img className="top-[60px] absolute left-4 w-[311px] h-px object-cover" alt="Line" src={line} />
        <img className="top-24 absolute left-4 w-[311px] h-px object-cover" alt="Line" src={line2} />
        <img className="top-[132px] absolute left-4 w-[311px] h-px object-cover" alt="Line" src={line3} />
        <img className="top-[168px] absolute left-4 w-[311px] h-px object-cover" alt="Line" src={line4} />
        <img className="top-[204px] absolute left-4 w-[311px] h-px object-cover" alt="Line" src={line5} />
        <img className="top-60 absolute left-4 w-[311px] h-px object-cover" alt="Line" src={line6} />

        {/* Valori asse Y ($) */}
        <div className="absolute top-16 left-4 w-9 h-[158px] flex flex-col gap-[22px] text-[#828282] text-[10px]">
          <div>$50K</div>
          <div>$45K</div>
          <div>$40K</div>
          <div>$35K</div>
          <div>$30K</div>
        </div>

        {/* Valori asse X (Date) */}
        <div className="absolute top-[244px] left-4 w-[323px] h-3.5 flex gap-[26px] text-[#828282] text-[10px]">
          <div className="w-[35px]">Nov 23</div>
          <div className="w-[13px]">24</div>
          <div className="w-[13px]">25</div>
          <div className="w-[13px]">26</div>
          <div className="w-3">27</div>
          <div className="w-[13px]">28</div>
          <div className="w-[13px]">29</div>
          <div className="w-[13px]">30</div>
        </div>

        {/* Grafici SVG */}
        <div className="absolute w-[calc(100%_-_42px)] top-[83px] left-4 h-[157px]">
          <img className="absolute w-full top-0 left-3 h-[157px] object-cover" alt="Graph" src={graph} />
          <img className="absolute w-full -top-0.5 -left-0.5 h-40 object-cover" alt="Graph" src={graph2} />
        </div>

        {/* Indicatore attivo (pallino blu) */}
        <div className="absolute top-[68px] right-[11px] w-[30px] h-[30px] flex justify-end rounded-[15px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(45,110,255,1)_62%,rgba(45,110,255,0)_100%)]">
          <div className="mt-[11px] w-2 h-2 mr-[11px] bg-[#2d6eff] rounded" />
        </div>

        <div className="absolute top-4 left-4 font-semibold text-black text-sm tracking-[0] leading-[19.6px] whitespace-nowrap">
          Grafico Umidità
        </div>
      </div>

      {/* Freccia Lunga */}
      <img
        className="absolute top-[352px] left-[143px] w-[50px] h-[50px] aspect-[1] object-cover"
        alt="Freccia lunga"
        src={icons8FrecciaLungaADestra501}
      />

      <div className="absolute top-[346px] left-[calc(50%_-_118px)] w-[337px] h-[94px] flex items-center justify-center font-bold text-black text-2xl text-center tracking-[-0.24px] leading-[25.9px]">
        ...
      </div>

      {/* Bottone Soglie */}
      <button className="flex w-[123px] h-[31px] items-center justify-center gap-2 px-4 py-0 absolute top-[81px] left-[235px] bg-black rounded-lg border-none cursor-pointer hover:opacity-80 transition-opacity">
        <div className="relative flex items-center justify-center w-fit font-medium text-white text-sm tracking-[0] leading-[19.6px] whitespace-nowrap">
          SOGLIE
        </div>
      </button>

      {/* Titolo Arnia Digitale */}
      <div className="absolute top-[50px] left-[calc(50%_-_148px)] w-[157px] h-[94px] flex items-center justify-center font-bold text-black text-2xl text-center tracking-[-0.24px] leading-[25.9px]">
        ARNIA DIGITALE
      </div>

      {/* Selettore Luogo */}
      <div className="absolute top-[calc(50%_-_231px)] left-11 w-[223px] h-7 flex items-center justify-center font-semibold text-black text-xl tracking-[-0.40px] leading-[28.0px]">
        Seleziona il luogo&nbsp;&nbsp;:
      </div>

      <img
        className="absolute top-[162px] left-0.5 w-[41px] h-[41px] aspect-[1] object-cover"
        alt="Image"
        src={image9}
      />

      <div className="flex w-[360px] h-10 items-center gap-3 pl-3 pr-4 py-2 absolute top-[206px] left-2 bg-[#ffe0ac] rounded-lg">
        <div className="relative w-6 h-6">
          {/*<img className="absolute w-[66.67%] h-[66.67%] top-[8.33%] left-[8.33%]" alt="Vector" src={vector} />
          <img className="absolute w-[18.13%] h-[18.13%] top-[65.21%] left-[65.21%]" alt="Vector" src={image} />*/}
        </div>
        <div className="flex-1 text-[#828282] truncate">
          Luogo
        </div>
      </div>

      {/* Selettore Arnia */}
      <p className="absolute top-[calc(50%_-_145px)] left-3 w-[322px] h-7 flex items-center justify-center font-semibold text-black text-xl tracking-[-0.40px] leading-[28.0px]">
        Seleziona l’arnia che vuoi visitare:
      </p>

      <div className="flex w-[360px] h-10 items-center gap-3 pl-3 pr-4 py-2 absolute top-[289px] left-2 bg-[#ffe0ac] rounded-lg">
        <div className="relative w-6 h-6">
          {/* <img className="absolute w-[66.67%] h-[66.67%] top-[8.33%] left-[8.33%]" alt="Vector" src={vector2} />
          <img className="absolute w-[18.13%] h-[18.13%] top-[65.21%] left-[65.21%]" alt="Vector" src={vector3} /> 
          */}
        </div>
        <div className="w-[279px] text-[#828282] truncate">
          Arnia
        </div>
      </div>
    </div>
  );
}

export default App;