
import { Prop, SchemaFactory, Schema} from "@nestjs/mongoose";
import { Document } from "mongoose";


@Schema()
export class Pokemon extends Document{

   // id: string //mongo me lo da
    @Prop({ 
        unique: true,
        index: true,
        
    })
    name : string ;
    @Prop({ 
        unique: true, //va aser unica
        index: true,    //va a tener un indice
        
    })
    no: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);