ALTER PROCEDURE "pears"."NetCandidateRegistration"( in pWebUserID char(20),in pDepartmentID char(10) ) 
result( departmentid char(10),personid char(20),departmentname char(100),temp smallint,perm smallint ) 
//IQXNet
begin
  select department.departmentid,
    isnull(search.personid,(select first personid from iqxnetuserlink where iqxnetuserid = pWebUserID)) as personid,
    department.name,
    search.temp,
    search.permanent
    from department left outer join search on department.departmentid = search.departmentid and search.personid = any(select personid from iqxnetuserlink where iqxnetuserid = pWebUserID)
    where department.departmentid = pDepartmentID
end