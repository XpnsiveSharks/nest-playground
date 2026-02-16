import { Controller,Get,Param } from '@nestjs/common';

@Controller('user')
export class UserController {

 private names: string[] = ['Kenneth', 'Marnel', 'Gab'];


@Get()
show(){
    return this.names;
}


@Get(':id')
showById(@Param('id') id:string)
{

const i = parseInt(id);

const person = this.names[i];


return {
    'id' : i,
    'person' : person
};


}






}
