create PROCEDURE pears."NetShortlistCandidate"(in pWebUserID char(20), in "pPersonID" char(20) default null,in "pVacancyId" char(20) ) 
result( "pResult" char(250) ) 
// IQXWeb
begin
  declare userClass char(20);
  
  set userClass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);

set pWebUserID = 'XX0SJUVS240520130000';
set pWebUserID = 'XX0SVLVS240520130007';

  if userClass='Candidate' and pPersonID is null then
     set pPersonID=(select first personid from iqxnetuserlink where iqxnetuserid = pWebUserID);
  end if;

  if pPersonID is null then
    select '98:~pPersonID required';
    return;
  end if;

  if not pPersonID = any(
        select personid from iqxnetuserlink where iqxnetuserid = pWebUserID union
        select p.personid from pay_employee p key join company as agcomp key join employment as agemp key join iqxnetuserlink
          where iqxnetuserlink.iqxnetuserid = pWebUserID    --BMH empty join!
  ) then
    select '99:~Permission denied';
    return
  end if;

insert into bmh values(pPersonID);
  -- end
  
  call "IQXNetPopup"("pWebUserID","pPersonID",null,null,null,                     100,null             ,'Web vacancy application',null);
--call "IQXNetPopup"("pWebUserID","pPersonID","empid","pvacancyid","pplacementid","pprogressid","ptype",'Web vacancy application',"pdescription");
-- Maintenance Agency Setup
-- saffid
  select '0:~Success'

/*  declare "Person" char(20);
  declare "Applied" char(20);
  declare "VacancyOwner" char(20);
  if "pWebUserId" is null then
    select '99:~You are not logged in';
    return
  end if;
  set "VacancyOwner" = (select "staffid" from "vacancy" where "pVcancyid" = "JobId");
  set "Person" = (select "IQXNetUserLink"."PersonID" from "IQXNetUserLink" where "iqxnetuserlink"."iqxnetuserid" = "pwebuserid");
  set "Applied" = (select "status" from "progress" where "pVcancyid" = "JobId" and "personid" = "person");
  if "Applied" > '' then
    select '99:~You have already Applied for this post';
    return
  end if;
  insert into "progress"( "progressid","vacancyid","actiondate","status","personid","staffId" ) values( "uniquekey"('X'),"JobId","getdate"(),'A',"Person","VacancyOwner" ) ;
  select '0:~Success'*/
end