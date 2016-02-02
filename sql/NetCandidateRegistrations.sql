ALTER PROCEDURE "pears"."NetCandidateRegistrations"( in pWebUserID char(20) ) 
result( DepartmentID char(10),PersonID char(20),DepartmentName char(100),TempJobs smallint,PermJobs smallint,Details char(100) ) 
// IQXWeb
begin
  select department.departmentid,search.personid,department.name,isnull(search.temp,0) as TempJobs,isnull(search.permanent,0) as PermJobs,
    (if TempJobs*PermJobs <> 0 then 'Temp and Permanent Jobs' else if TempJobs <> 0 then 'Temp Jobs'
      else if PermJobs <> 0 then 'Permanent Jobs'
        else 'Not Registered'
        endif
      endif endif) as details
    from department left outer join search on department.departmentid = search.departmentid and search.personid = any(select personid from iqxnetuserlink where iqxnetuserid = pWebUserID)
    where department.searchable = 1 and department.publishtoweb = 1
    order by department.sortorder asc,department.name asc
end