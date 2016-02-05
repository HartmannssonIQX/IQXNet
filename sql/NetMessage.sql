create procedure pears.NetMessage(in pWebUserID char(20),in ptype char(20),in ptitle char(100),in pdescription long varchar,in pvacancyid char(20) default
null,in pplacementid char(20) default null,in pprogressid char(20) default null,in pprovtimesheetid char(20) default
null,in ptimesheetid char(20) default null)
result(pResult char(250))
// IQXWeb
begin
  declare persid char(20);
  declare empid char(20);
  set persid=null;
  set empid=(select first employmentid from iqxnetuserlink where iqxnetuserid = pwebuserid);
  if empid is null then
    set persid=(select first personid from iqxnetuserlink where iqxnetuserid = pwebuserid);
    if persid is null then
      select '99:~Permission denied';
      return
    end if
  end if;
  set pprovtimesheetid=nullif(trim(pprovtimesheetid),'');
  set ptimesheetid=nullif(trim(ptimesheetid),'');
  if pprovtimesheetid is not null then
    set pvacancyid=(select first vacancyid from tempprovtimesheet where tempprovtimesheetid = pprovtimesheetid)
  end if;
  if ptimesheetid is not null then
    set pplacementid=(select first placementid from temptimesheet where temptimesheetid = ptimesheetid);
    set pvacancyid=(select first vacancyid from placement where placementid = pplacementid)
  end if;
  if trim(isnull(ptype,'')) = '' then
    select '101:~Invalid message type';
    return
  end if;
  if trim(isnull(ptitle,'')) = '' then
    select '102:~Incomplete message';
    return
  end if;
  call IQXNetPopup(pWebUserID,persid,empid,pvacancyid,pplacementid,pprogressid,ptype,ptitle,pdescription);
  select '0:~Success'
end