var iq=require('../srvControllers/iqTest')
var exec=iq.exec
var expect=iq.expect
var should=iq.should

describe('IQXHub Pool Test', function(){
  // NBB we are in a promise environment - make sure you always RETURN the assertion or the test will automatically succeed without waiting
  
  it('Make multiple calls', function(){
    for(i=0;i<20;i++) {
      exec('IQXCall_/NetQuestionnaire','',{ptaglocation:'C'})
      }
    // At the moment it simply stresses the pool (connection count should expand to the max)
    // Ideally we need some kind of test!
    })
    
    
  })
  

