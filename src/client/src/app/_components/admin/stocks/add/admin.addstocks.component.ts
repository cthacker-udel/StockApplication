import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/config/config.service';
import { ApiMessage } from 'src/app/_models/ApiMessage';
import { Stock } from 'src/app/_models/Stock';
import { ROUTE_PREFIXES } from 'src/shared/constants/api';
import { REGEX_EXPRESSIONS } from 'src/shared/constants/regex';

@Component({
  selector: 'admin-add-stock',
  templateUrl: './admin.addstocks.component.html',
  styleUrls: ['./admin.addstocks.component.css'],
})
export class AdminAddStocksComponent implements OnInit {
  controlNames = ['symbol', 'price', 'shares', 'volume', 'risk'];
  addStocksFormGroup: FormGroup = new FormGroup({});

  constructor(
    private _router: Router,
    private _configService: ConfigService,
    private toastr: ToastrService
  ) {}

  doesStockAlreadyExist = async (
    control: AbstractControl
  ): Promise<ValidationErrors | null> => {
    const { value } = control;
    const getStock = this._configService.getConfig<Stock | null>(
      `${ROUTE_PREFIXES.stock}get/symbol?symbol=${(
        value as string
      ).toUpperCase()}`
    );
    getStock.subscribe((foundStock: Stock | null) => {
      const doesExist = foundStock !== null;
      if (doesExist) {
        this.addStocksFormGroup.controls['symbol'].setErrors({
          symbolAlreadyExists: true,
        });
      } else {
        if (this.addStocksFormGroup.controls['symbol'].errors) {
          delete this.addStocksFormGroup.controls['symbol'].errors[
            'symbolAlreadyExists'
          ];
        }
      }
    });
    return null;
  };

  ngOnInit(): void {
    this.addStocksFormGroup = new FormGroup({
      symbol: new FormControl(
        '',
        [
          Validators.required,
          Validators.maxLength(5),
          Validators.pattern(REGEX_EXPRESSIONS.NO_SPACES),
        ],
        [this.doesStockAlreadyExist]
      ),
      price: new FormControl(1, [Validators.min(1)]),
      shares: new FormControl(1, [Validators.min(1)]),
      volume: new FormControl(1, [Validators.min(1)]),
      risk: new FormControl(1, [Validators.min(1)]),
    });
  }

  get symbol() {
    return this.addStocksFormGroup.get('symbol');
  }

  get price() {
    return this.addStocksFormGroup.get('price');
  }

  get shares() {
    return this.addStocksFormGroup.get('shares');
  }

  get volume() {
    return this.addStocksFormGroup.get('volume');
  }

  get risk() {
    return this.addStocksFormGroup.get('risk');
  }

  onSubmit() {
    const symbolValue = this.symbol?.value;
    const priceValue = this.price?.value;
    const sharesValue = this.shares?.value;
    const volumeValue = this.volume?.value;
    const riskValue = this.risk?.value;
    if (
      !this.addStocksFormGroup.invalid &&
      symbolValue &&
      priceValue &&
      sharesValue &&
      volumeValue &&
      riskValue
    ) {
      const request = this._configService.postConfig<ApiMessage | {}>(
        `${ROUTE_PREFIXES.stock}add`,
        {
          symbol: symbolValue,
          price: priceValue,
          shares: sharesValue,
          volume: volumeValue,
          risk: riskValue,
        }
      );
      request.subscribe((result: ApiMessage | {}) => {
        if ((result as ApiMessage) === undefined) {
          this.toastr.success(`Added Stock ${symbolValue}!`);
          this.controlNames.forEach((eachName: string, _ind: number) => {
            this.addStocksFormGroup.controls[eachName].setErrors(null);
            if (_ind > 0) {
              this.addStocksFormGroup.controls[eachName].setValue(1);
            } else {
              this.addStocksFormGroup.controls[eachName].setValue('');
            }
          });
        } else {
          this.toastr.error('Please check the form for errors');
        }
      });
    } else {
      this.toastr.error('Form has errors');
    }
  }
}
