package com.projects.chatApp.Controller;


import com.projects.chatApp.Entity.Message;
import com.projects.chatApp.Entity.Room;
import com.projects.chatApp.Services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class RoomController {

    @Autowired
    private RoomService roomService;

    // create room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId){
        if(roomService.roomExists(roomId)){
            return ResponseEntity.badRequest().body("RoomId is invalid!!");
        }else{
            Room room = roomService.createRoom(roomId);
            return ResponseEntity.status(HttpStatus.CREATED).body(room);
        }
    }

    // get room
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable String roomId){
        if(!roomService.roomExists(roomId)){
            return ResponseEntity.notFound().build();
        }
        Room room = roomService.getRoomByRoomId(roomId);
        return ResponseEntity.ok(room);
    }


    // get messages of room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size
    ){
        if(roomService.roomExists(roomId)){
            List<Message> messages = roomService.getMessages(roomId);
            int start = Math.max(0,messages.size() - (page+1)*size);
            int end = Math.min(messages.size(), start + size);
            List<Message> messagesPaginated = messages.subList(start,end);
            return ResponseEntity.ok(messagesPaginated);

        }else{
            return ResponseEntity.notFound().build();
        }
    }
}
