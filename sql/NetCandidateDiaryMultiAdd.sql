create procedure pears.NetCandidateDiaryMultiAdd(in pWebUserID char(20),in pShiftType char(10),in pDateFrom char(50),in pMonTick char(3) default 'off',in pTimeFromMon char(25) default
null,in pTimeToMon char(25) default null,in pTueTick char(3) default 'off',in pTimeFromTue char(25) default
null,in pTimeToTue char(25) default null,in pWedTick char(3) default 'off',in pTimeFromWed char(25) default
null,in pTimeToWed char(25) default null,in pThuTick char(3) default 'off',in pTimeFromThu char(25) default
null,in pTimeToThu char(25) default null,in pFriTick char(3) default 'off',in pTimeFromFri char(25) default
null,in pTimeToFri char(25) default null,in pSatTick char(3) default 'off',in pTimeFromSat char(25) default
null,in pTimeToSat char(25) default null,in pSunTick char(3) default 'off',in pTimeFromSun char(25) default
null,in pTimeToSun char(25) default null)
result(pResult char(250))
// IQXWeb
begin
  declare persid char(20);
  declare dstart date;
  declare ddate date;
  declare dend date;
  declare tFrom time;
  declare tTo time;
  declare CanAuthorise smallint;
  declare pvacancyid char(20);
  declare thelog char(20);
  set persid=(select first personid from iqxnetuserlink where iqxnetuserid = pwebuserid);
  if persid is null then
    select '99:~Permission denied';
    return
  end if;
  set dstart=iqxnetstringtodate(pDateFrom);
  if dstart is null then
    select '500:~Invalid start date';
    return
  end if;
  if substring(pDateFrom,0,3) <> 'Mon' then
    select '500:~Start date must be a Monday';
    return
  end if;
  if pshifttype not in( 'H','A','U') then //Holiday/Available/Unavailable
    select '101:~invalid shift type';
    return
  end if;
  set CanAuthorise=IQXNetHasPermission(pWebUserID,'AUTHORISEJOBS');
  set ddate=dstart;
  if pMonTick = 'on' then
    set tFrom=iqxnetstringtotime(pTimeFromMon);
    set tTo=iqxnetstringtotime(pTimeToMon);
    insert into tempshift( tempshiftid,personid,shiftdate,timefrom,timeto,state) values( uniquekey(ddate),persid,ddate,tFrom,tTo,pshifttype) 
  end if;
  set ddate=ddate+1;
  if pTueTick = 'on' then
    set tFrom=iqxnetstringtotime(pTimeFromTue);
    set tTo=iqxnetstringtotime(pTimeToTue);
    insert into tempshift( tempshiftid,personid,shiftdate,timefrom,timeto,state) values( uniquekey(ddate),persid,ddate,tFrom,tTo,pshifttype) 
  end if;
  set ddate=ddate+1;
  if pWedTick = 'on' then
    set tFrom=iqxnetstringtotime(pTimeFromWed);
    set tTo=iqxnetstringtotime(pTimeToWed);
    insert into tempshift( tempshiftid,personid,shiftdate,timefrom,timeto,state) values( uniquekey(ddate),persid,ddate,tFrom,tTo,pshifttype) 
  end if;
  set ddate=ddate+1;
  if pThuTick = 'on' then
    set tFrom=iqxnetstringtotime(pTimeFromThu);
    set tTo=iqxnetstringtotime(pTimeToThu);
    insert into tempshift( tempshiftid,personid,shiftdate,timefrom,timeto,state) values( uniquekey(ddate),persid,ddate,tFrom,tTo,pshifttype) 
  end if;
  set ddate=ddate+1;
  if pFriTick = 'on' then
    set tFrom=iqxnetstringtotime(pTimeFromFri);
    set tTo=iqxnetstringtotime(pTimeToFri);
    insert into tempshift( tempshiftid,personid,shiftdate,timefrom,timeto,state) values( uniquekey(ddate),persid,ddate,tFrom,tTo,pshifttype) 
  end if;
  set ddate=ddate+1;
  if pSatTick = 'on' then
    set tFrom=iqxnetstringtotime(pTimeFromSat);
    set tTo=iqxnetstringtotime(pTimeToSat);
    insert into tempshift( tempshiftid,personid,shiftdate,timefrom,timeto,state) values( uniquekey(ddate),persid,ddate,tFrom,tTo,pshifttype) 
  end if;
  set ddate=ddate+1;
  if pSunTick = 'on' then
    set tFrom=iqxnetstringtotime(pTimeFromSun);
    set tTo=iqxnetstringtotime(pTimeToSun);
    insert into tempshift( tempshiftid,personid,shiftdate,timefrom,timeto,state) values( uniquekey(ddate),persid,ddate,tFrom,tTo,pshifttype) 
  end if;
  if CanAuthorise = 1 then
    call IQXNetPopup(pWebUserID,null,null,pvacancyid,null,null,null,'New shift requirement(s) added',thelog)
  end if;
  select '0:~Success'
end