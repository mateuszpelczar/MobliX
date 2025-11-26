ALTER TABLE messages
  ADD COLUMN advertisement_id BIGINT;

CREATE INDEX idx_messages_advertisement_id ON messages(advertisement_id);

ALTER TABLE messages
  ADD CONSTRAINT fk_messages_advertisement
  FOREIGN KEY (advertisement_id) REFERENCES ogloszenia(id);