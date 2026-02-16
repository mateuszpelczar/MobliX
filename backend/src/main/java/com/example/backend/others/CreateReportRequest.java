package com.example.backend.others;

public class CreateReportRequest {

    private String reason;
    private String comment;

    public CreateReportRequest(){}

    public CreateReportRequest(String reason, String comment){
      this.reason= reason;
      this.comment= comment;
    }

   

    public String getReason(){
      return reason;
    }

    public void setReason(String reason){
      this.reason = reason;
    }

    public String getComment(){
      return comment;
    }

    public void setComment(String comment){
      this.comment = comment;
    }
  
}