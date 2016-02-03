ALTER PROCEDURE "pears"."NetDefineProcs"( in "pWebUserID" char(20) ) 
result( "proccessName" long varchar,"paramName" long varchar,"paramIO" long varchar,"paramDefault" long varchar,"paramType" long varchar ) 
-- procccessName - Name of the procedure
-- paramName - Name of the parameter (both inputs and outputs listed)
-- paramIO - Determines if the paramater is an input or output (0=IN | 1-OUT)
-- paramID - The order that the params come within the procedure (1=FIRST | >1 LAST)
-- paramDefault - The default value of that parameter
-- paramType - The datatype of that param
-- Created (06/01/2015)
begin
  --    SELECT 
  --        proc_name, parm_name,
  --        --, parm_mode_in, parm_mode_out,
  --        parm_type, parm_id, [default], base_type_str
  --    FROM 
  --        sys.sysprocedure pr key join SYS.SYSPROCPARM pa
  --    WHERE 
  --        proc_name like 'net%'
  --    ORDER BY 
  --        proc_name, parm_type, parm_id
  select "proc_name" as "proccessName",
    "LIST"("parm_name" order by "parm_type" asc,"parm_id" asc) as "paramName",
    "LIST"("parm_type" order by "parm_type" asc,"parm_id" asc) as "paramIO",
    "LIST"("isnull"("default",'null') order by "parm_type" asc,"parm_id" asc) as "paramDefault",
    "LIST"("isnull"("base_type_str",'null') order by "parm_type" asc,"parm_id" asc) as "paramType"
    from "sys"."sysprocedure" as "pr" key join "SYS"."SYSPROCPARM" as "pa" --where pr.proc_name = o.proc_name
    where "proc_name" like 'net%'
    group by "proc_name"
    order by 1 asc
end