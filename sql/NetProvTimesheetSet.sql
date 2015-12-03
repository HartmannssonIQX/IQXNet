create procedure pears.NetProvTimesheetSet(in pWebUserID char(20),in ptempprovtimesheetid char(20),in pTheirRef char(100) default null, in "qanswers" long varchar default null)
result(pResult char(250))
// IQXWeb
begin
  declare cid char(20);
  declare pid char(20);
  select e.companyid,t.personid into cid,pid 
  from tempprovtimesheet as t key join vacancy key join employment as e
  where t.tempprovtimesheetid=ptempprovtimesheetid;
  if NetHasPermission(pWebUserID,pid,cid)=0 then
    select '99:~Permission denied';
    return
  end if;
  if pTheirRef is not null then
    update tempprovtimesheet set theirref = ucase(ptheirref) where tempprovtimesheetid = ptempprovtimesheetid;
  end if;
  call "IQXNetSaveQuestionnaire"("ptempprovtimesheetid","qanswers");
  select '0:~Success'
end