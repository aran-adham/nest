import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Req,
  Put,
  Post,
  Delete,
  Param,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { AppService } from "./app.service";
import * as bcrypt from "bcrypt";
import { Response, Request } from "express";
import { JwtService } from "@nestjs/jwt";
@Controller("api")
export class AppController {
  constructor(
    private readonly appService: AppService,
    private jwtService: JwtService,
  ) {}

  @Post("register")
  async register(
    @Body("name") name: string,
    @Body("email") email: string,
    @Body("password") password: string,
  ) {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.appService.create({
      name,
      email,
      password: hashedPassword,
    });
    delete user.password;
    return user;
  }

  @Post("login")
  async login(
    @Body("email") email: string,
    @Body("password") password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Validate the user
    const user = await this.appService.validateUser(email, password);

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    // Create JWT token
    const jwt = await this.jwtService.signAsync({ id: user.id });

    // Set cookie with JWT
    response.cookie("jwt", jwt, { httpOnly: true });

    return {
      message: "success",
    };
  }

  @Get("user")
async user(@Req() request: Request) {
  try {
    // Get JWT token from cookie
    const cookie = request.cookies["jwt"];
    
    // Verify the JWT token (use 'await' to ensure it's fully resolved)
    const data = await this.jwtService.verifyAsync(cookie);
    
    // If data is invalid, throw an error
    if (!data) {
      throw new UnauthorizedException("Invalid token");
    }

    // Find the user in the database using the decoded JWT data
    const user = await this.appService.findOne({ id: data["id"] });

    // If no user is found, throw an error
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Remove password before sending the user object
    const { password, ...result } = user;
    return result;

  } catch (e) {
    // Throw unauthorized exception if any error occurs
    throw new UnauthorizedException("User not authenticated");
  }
}


  @Get("users")
  async getAllUsers() {
    return this.appService.findAll(); // Returns all users
  }

  @Get("users/:id")
  async getUser(@Param("id") id: string) {
    const user = await this.appService.findOne({ id });
    
    if (!user) {
      throw new BadRequestException("User not found");
    }

    // Remove password before sending the user object
    const { password, ...result } = user;
    return result;
  }

  // Update a user by ID
  @Put("users/:id")
  async updateUser(
    @Param("id") id: string,
    @Body("name") name: string,
    @Body("email") email: string,
    @Body("password") password: string,
  ) {
    // Find the user
    const user = await this.appService.findOne({ id });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    // Hash the new password if provided
    let hashedPassword = user.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Update the user with new details
    const updatedUser = await this.appService.update(id, {
      name,
      email,
      password: hashedPassword,
    });

    delete updatedUser.password; // Remove password from the returned user
    return updatedUser;
  }

  @Delete("users/:id")
  async deleteUser(@Param("id") id: string) {
    const user = await this.appService.findOne({ id });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    await this.appService.delete(id);
    return { message: "User deleted successfully" };
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("jwt");
    return {
      message: "success",
    };
  }
}
