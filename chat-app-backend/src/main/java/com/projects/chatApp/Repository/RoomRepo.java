package com.projects.chatApp.Repository;

import com.projects.chatApp.Entity.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.ResponseStatus;

@Repository
public interface RoomRepo extends MongoRepository<Room,String> {
    // get messages by room id

    Room findByRoomId(String roomId);
    boolean existsByRoomId(String roomId);
}
