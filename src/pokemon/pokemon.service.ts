import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';


@Injectable()
export class PokemonService {

  private defaultLimit: number;
  constructor(
    @InjectModel( Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ){
    
    this.defaultLimit = configService.get<number>('defaultLimit');//<>generico
    
  }


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();//toLocalelowercase devuelve el string en minuscula

    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;

    } catch(error){
      this.handleExceptions(error);
    }
    
  }

  findAll(paginationDto:PaginationDto) {

    const {limit = this.defaultLimit, offset = 0 } = paginationDto;
    return this.pokemonModel.find()
    .limit(limit) //limite de datos
    .skip(offset)// limite de paginacion
    .sort({//ordenar alfabeticamente
      no: 1
    })
    .select('-__v');//para quitarle los giones abajo
    
    
  }

  async findOne(term: string) {

    let pokemon : Pokemon;

    if(!isNaN(+term)){ //term es el id solo con otro nombre
      pokemon = await this.pokemonModel.findOne({ no: term})
    }
    //mongo id

    if ( !pokemon && isValidObjectId( term)){
      pokemon = await this.pokemonModel.findById( term);

    }

    //name
    if( !pokemon){
      pokemon = await this.pokemonModel.findOne({name : term.toLocaleLowerCase().trim()})
    }

    if(!pokemon){
      throw new NotFoundException(`Pokmeon with  id, name or no "${ term} nor found `)
    }
    return pokemon;

    
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {


    const pokemon =await this.findOne( term);
    if( updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

      try {
        await pokemon.updateOne( updatePokemonDto);

        return {...pokemon.toJSON(), ...updatePokemonDto};

      } catch (error) {
        this.handleExceptions(error);
      }
  }

  async remove(id: string) {

    // const pokemon =await this.findOne(id);
    // await pokemon.deleteOne();
    // return {id}  ;                    
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const  {deletedCount} = await this.pokemonModel.deleteOne({ _id: id});
    if(deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    return;

    
  }


  private handleExceptions( error : any){
    if(error.code ===11000){
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Cant create Pokemon - Check server logs`);
  }
}
