ALTER PROCEDURE "pears"."NetCandidateDepartmentRegister"( in pWebUserID char(20),in pdepartmentid char(10),in ppersonid char(20) default null,
  in ptemp smallint default null,in pperm smallint default null, in pdepartmentname char(100) default null, in qanswers long varchar default null ) 
result( pResult char(250) ) 
// IQXWeb
begin
  if trim(isnull(ppersonid,'')) = '' then
    set ppersonid = (select first personid from iqxnetuserlink where iqxnetuserid = pwebuserid)
  end if;
  if not ppersonid = any(select personid from iqxnetuserlink where iqxnetuserid = pwebuserid) then
    select '99:~Permission denied';
    return
  end if;
  set ptemp = isnull(ptemp,0);
  set pperm = isnull(pperm,0);
  if ptemp = 0 and pperm = 0 then
    delete from search where personid = ppersonid and departmentid = pdepartmentid
  else
    update search set temp = ptemp,permanent = pperm where personid = ppersonid and departmentid = pdepartmentid;
    if @@rowcount = 0 then
      insert into search( searchid,personid,departmentid,temp,permanent ) values( uniquekey(''),ppersonid,pdepartmentid,ptemp,pperm ) 
    end if end if;
  call IQXNetSaveQuestionnaire(ppersonid,qanswers);
  select '0:~Success'
end