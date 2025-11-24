function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[14px] items-start leading-[normal] relative shrink-0 text-white w-[308px]">
      <p className="font-['Merriweather_120pt_SemiCondensed:Regular',sans-serif] not-italic relative shrink-0 text-[20px] w-[274px]">{`Every First Monday, Tuesday, & Wednesday of the month`}</p>
      <p className="font-['PolySans_Trial:Bulky_Wide','Noto_Sans:Bold',sans-serif] min-w-full relative shrink-0 text-[31px] uppercase w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        5:00 PM - 7:00 PM
      </p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[39px] items-center leading-[normal] not-italic relative shrink-0 text-white w-[256px]">
      <p className="font-['Merriweather_120pt_SemiCondensed:Regular',sans-serif] relative shrink-0 text-[20px] text-center w-full">Friday Vigil</p>
      <p className="font-['PolySans_Trial:Bulky_Wide',sans-serif] relative shrink-0 text-[31px] uppercase w-full">FROM 11:00 PM</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[14px] items-center leading-[normal] relative shrink-0 text-white w-[375px]">
      <p className="font-['Merriweather_120pt_SemiCondensed:Regular',sans-serif] not-italic relative shrink-0 text-[20px] text-center text-nowrap whitespace-pre">
        Following Sunday
        <br aria-hidden="true" />
        (Covenant Sunday)
      </p>
      <p className="font-['PolySans_Trial:Bulky_Wide','Noto_Sans:Bold',sans-serif] min-w-full relative shrink-0 text-[31px] uppercase w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        8:00 AM - 12:00 NOON
      </p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex gap-[87px] items-center left-[calc(50%+0.5px)] top-[94px] translate-x-[-50%]">
      <Frame1 />
      <Frame2 />
      <Frame3 />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-[#722f37] overflow-clip relative rounded-[16px] size-full">
      <p className="absolute font-['Montserrat:Medium',sans-serif] leading-[normal] left-[calc(50%-162px)] not-italic text-[#d4af37] text-[32px] text-nowrap top-[28px] whitespace-pre">Our Monthly Revival</p>
      <Frame4 />
    </div>
  );
}