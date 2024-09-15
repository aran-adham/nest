import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(data: any): Promise<User> {
    return this.userRepository.save(data);
  }

  // Create a method to validate the user
  async validateUser(email: string, password: string): Promise<User | null> {
    // Check if the user exists
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      return null; // User doesn't exist
    }

    // Verify the password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return null; // Password is incorrect
    }

    return user; // User is valid
  }


  // async findOne(condition: any): Promise<User | undefined> {
  //   return this.userRepository.findOneBy(condition);
  // }

  async findOne(condition: any): Promise<User | undefined> {
    return this.userRepository.findOne({ where: condition });
  }

  // New function to retrieve all users
  async findAll(): Promise<User[]> {
    return this.userRepository.find(); // Finds all users
  }

  async update(id: string, data: any) {
    await this.userRepository.update(id, data);
    return this.findOne({ id }); // Return updated user
  }

  async delete(id: string) {
    return this.userRepository.delete(id);
  }
  

}
