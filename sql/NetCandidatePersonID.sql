create procedure pears.NetCandidatePersonID( in pWebUserID char(20) ) 
result( PersonID char(20) ) 
// IQXWeb
begin
select first L.personid from iqxnetuserlink as L key join iqxnetuser as U 
  where U.iqxnetuserid=pWebUserID and U.iqxnetuserclassid='CANDIDATE' and L.personid is not null
end