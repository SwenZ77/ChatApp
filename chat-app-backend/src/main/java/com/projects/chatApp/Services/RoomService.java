package com.projects.chatApp.Services;


import com.projects.chatApp.Entity.Message;
import com.projects.chatApp.Entity.Room;
import com.projects.chatApp.Repository.RoomRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RoomService {
    @Autowired
    private RoomRepo roomRepo;

    public Room createRoom(String roomId) {
        Room room = new Room();
        room.setRoomId(roomId);
        return roomRepo.save(room);
    }

    public boolean roomExists(String roomId) {
        return roomRepo.existsByRoomId(roomId);
    }

    public Room getRoomByRoomId(String roomId) {
        return roomRepo.findByRoomId(roomId);
    }

    public List<Message> getMessages(String roomId) {
        Room room = roomRepo.findByRoomId(roomId);
        return room.getMessages();
    }

    public Room saveRoom(Room room){
        return roomRepo.save(room);
    }
}
