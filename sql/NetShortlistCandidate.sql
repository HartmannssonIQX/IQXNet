ALTER PROCEDURE "pears"."NetShortlistCandidate"( in "pPersonId" char(20) default null,in "vacancyId" char(20) ) 
result( "pResult" char(250) ) 
// IQXWeb
begin
  declare "Person" char(20);
  declare "Applied" char(20);
  declare "VacancyOwner" char(20);
  if "pWebUserId" is null then
    select '99:~You are not logged in';
    return
  end if;
  set "VacancyOwner" = (select "staffid" from "vacancy" where "vacancyid" = "JobId");
  set "Person" = (select "IQXNetUserLink"."PersonID" from "IQXNetUserLink" where "iqxnetuserlink"."iqxnetuserid" = "pwebuserid");
  set "Applied" = (select "status" from "progress" where "vacancyid" = "JobId" and "personid" = "person");
  if "Applied" > '' then
    select '99:~You have already Applied for this post';
    return
  end if;
  insert into "progress"( "progressid","vacancyid","actiondate","status","personid","staffId" ) values( "uniquekey"('X'),"JobId","getdate"(),'A',"Person","VacancyOwner" ) ;
  select '0:~Success'
end