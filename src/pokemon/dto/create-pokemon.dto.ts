import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";


export class CreatePokemonDto {
    //isinst, is positive, min 1
    @IsInt()
    @IsPositive()
    @Min(1)
    no: number;
    //is tstring, minlenght 1
    @IsString()
    @MinLength(1)
    name: string;

}
