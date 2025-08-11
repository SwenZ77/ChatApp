package com.projects.chatApp.Controller;

import com.projects.chatApp.Entity.Message;
import com.projects.chatApp.Entity.MessageRequest;
import com.projects.chatApp.Entity.Room;
import com.projects.chatApp.Services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Controller
@CrossOrigin("http://localhost:5173")
public class ChatController{

    @Autowired
    private RoomService roomService;

    // for sending and receiving messages
    @SendTo("/topic/room/{roomId}")
    @MessageMapping("/sendMessage/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest messageRequest
        ) throws Exception {
        Room room = roomService.getRoomByRoomId(messageRequest.getRoomId());

        Message message = new Message();
        message.setContent(messageRequest.getContent());
        message.setSender(messageRequest.getSender());
        message.setTimeStamp(LocalDateTime.now());

        if(room != null){
            room.getMessages().add(message);
            roomService.saveRoom(room);
        }else{
            throw new Exception("Room is invalid!!");
        }
        return message;
    }

}
