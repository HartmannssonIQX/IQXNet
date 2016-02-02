create FUNCTION pears."NetGetEmail"( in cpe char(2),in recid char(20) )
RETURNS char(250)
//IQXWeb
BEGIN
  declare rv char(250);
  if cpe = 'E' then
    set cpe='CP'
  end if;
  select first phone.number into rv from phone key join phonetype where phone.whoid = recid and phone.who = cpe and
    phonetype.name = 'E-mail' order by 1;
  set rv=replace(rv,'*','');
  return(rv)
END