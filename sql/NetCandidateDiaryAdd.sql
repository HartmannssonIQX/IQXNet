create procedure pears.NetCandidateDiaryAdd(in pWebUserID char(20) default null,in pshifttype char(10) default null,in pdatefrom char(50) default null,in pdateto char(50) default null,in ptimefrom char(50) default
null,in ptimeto char(50) default null,in IDCode char(20) default null,in pState char(2) default null)
result(pResult char(250))
// IQXWeb
begin
  declare persid char(20);
  declare dfrom date;
  declare dto date;
  declare tfrom time;
  declare tto time;
  set persid=(select first personid from iqxnetuserlink where iqxnetuserid = pwebuserid);
  if persid is null then
    select '99:~Permission denied';
    return
  end if;
  set pState=trim(isnull("left"(pState,1),''));
  if pState = 'C' then //Cancel
    update tempshift set state = pState,whencancelled = current timestamp,whocancelled = userstaffid,crefill = 1,clientconfirmed = 0,tempconfirmed = 1,cancelreason = 'T'
      where tempShiftID = IDCode and personid = persid and vacancyid is not null;
    call IQXNetRequestAction(pWebUserID,'CandidateReject','SHIFT',IDCode);
    select '0:~Success';
    return
  end if;
  if pState = 'F' then //conFirm
    update tempshift set tempconfirmed = 1 where tempshiftid = IDCode and personid = persid and vacancyid is not null;
    call IQXNetRequestAction(pWebUserID,'CandidateConfirm','SHIFT',IDCode);
    select '0:~Success';
    return
  end if;
  if pState = 'D' then //delete
    delete from tempshift where tempshiftid = IDCode and personid = persid and vacancyid is null and state in( 'H','A','U') ;
    call IQXNetRequestAction(pWebUserID,'CandidateDelete','SHIFT',IDCode);
    select '0:~Success';
    return
  end if;
  set pshifttype=trim(isnull(pshifttype,''));
  if substring(pshifttype,2,1) = 'W' then -- Whole days
    set ptimefrom='';
    set ptimeto=''
  end if;
  set pshifttype="left"(pshifttype,1);
  set dfrom=iqxnetstringtodate(pdatefrom);
  set dto=iqxnetstringtodate(pdateto);
  set tfrom=iqxnetstringtotime(ptimefrom);
  set tto=iqxnetstringtotime(ptimeto);
  if IDCode <> '' and pState = '' then
    update tempshift set shiftdate = dfrom,timefrom = tfrom,timeto = tto where tempShiftID = IDCode and vacancyid is null and personid = persid;
    select '0:~Success';
    return
  end if;
  if pshifttype not in( 'H','A','U') then //Holiday/Available/Unavailable
    select '101:~invalid availability type';
    return
  end if;
  if(trim(isnull(pdatefrom,'')) <> '' and dfrom is null)
    or(trim(isnull(pdateto,'')) <> '' and dto is null)
    or(trim(isnull(ptimefrom,'')) <> '' and tfrom is null)
    or(trim(isnull(ptimeto,'')) <> '' and tto is null) then
    select '102:~Invalid date or time';
    return
  end if;
  if dfrom is null then
    select '103:~Invalid date';
    return
  end if;
  set dto=isnull(dto,dfrom);
  if tfrom is null then
    set tto=null
  end if;
  if tto is null then
    set tfrom=null
  end if;
  while dfrom <= dto loop
    insert into tempshift( tempshiftid,personid,shiftdate,timefrom,timeto,state) values( uniquekey(dfrom),persid,dfrom,tfrom,tto,pshifttype) ;
    set dfrom=dfrom+1
  end loop;
  select '0:~Success'
end