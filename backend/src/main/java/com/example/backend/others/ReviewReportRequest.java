package com.example.backend.others;

public class ReviewReportRequest {

    private String action;
    private String moderatorNote;

    public ReviewReportRequest(){}

    public ReviewReportRequest(String action, String moderatorNote){
      this.action = action;
      this.moderatorNote = moderatorNote;
    }

  
    public String getAction(){
      return action;
    }

    public void setAction(String action){
      this.action = action;
    }

    public String getModeratorNote(){
      return moderatorNote;
    }

    public void setModeratorNote(String moderatorNote){
      this.moderatorNote = moderatorNote;
    }

    
  
}