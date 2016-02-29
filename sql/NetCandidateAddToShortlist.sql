create PROCEDURE pears.NetCandidateAddToShortlist(in pWebUserID char(20), in pPersonID char(20) default null,in pRefCode char(20) ) 
result( pResult char(250) ) 
// IQXWeb
begin
  declare userClass char(20);
  declare VacancyId char(20);
  
  set userClass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);

  if userClass='Candidate' and pPersonID is null then
     set pPersonID=(select first personid from iqxnetuserlink where iqxnetuserid = pWebUserID);
  end if;

  if pPersonID is null then
    select '98:~pPersonID required';
    return;
  end if;

  if  pPersonID = any(
        select personid from iqxnetuserlink where iqxnetuserid = pWebUserID union
        select p.personid from pay_employee p key join company as agcomp key join employment as agemp key join iqxnetuserlink
          where iqxnetuserlink.iqxnetuserid = pWebUserID
  ) then
    select '99:~Permission denied';
    return
  end if;
  
  set vacancyId=(select first vacancyId from vacancy where refcode = pRefCode);
  
  call IQXNetPopup(pWebUserID,pPersonID,null,VacancyId,null,                  100,null, 'Web vacancy application',null);
--call IQXNetPopup(pWebUserID,pPersonID,empid,pvacancyid,pplacementid,pprogressid,ptype,'Web vacancy application',pdescription);

  insert into progress( progressid,vacancyid,actiondate,status,personid,staffId ) values( uniquekey('X'),VacancyId,current date,'?',pPersonID,userstaffid ) ;
  select '0:~Success';

  end