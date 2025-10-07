import React, { useEffect, useState } from 'react';
import {useForm, FormProvider, useFieldArray} from 'react-hook-form';
import { useSelector } from 'react-redux';
import { AppState } from 'app-redux/configureStore';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from 'components/common/button';
import Loader from 'components/common/loader';
import TextField from 'components/common/formComponents/textField';
import Checkbox from 'components/common/formComponents/checkbox';
import Autocomplete from 'components/common/formComponents/autocomplete';
import ContentHeader from 'components/admin/contentHeader';
import CRUDNotFound from 'components/admin/crud/notFound';
import { ADMIN_PATH, ADMIN_MAIN } from 'utils/paths';
import { campaignsActions, Campaign } from "app-redux/campaigns";
import { accountUrl } from "app-redux/accounts/actions";
import { searchTemplateUrl } from "app-redux/search-templates/actions";
import { TemplateForm } from "app-redux/search-templates/model";
import {notify} from "helpers/notify";
import {useRouter} from "next/router";
import {useRequestErrors} from "hooks/useRequestErrors";
import SvgIcon from "@mui/material/SvgIcon";
import AddIcon from "@mui/icons-material/Add";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import moment from "moment";
import SearchTemplate from "components/admin/SearchTemplate";
import Alert from "@mui/material/Alert";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import SaveIcon from "@mui/icons-material/Save";
import SaveTemplateModal from "./SaveTemplateModal";
import {FilterService} from "../../../../helpers/filterService";
import {useNormalizeSettings} from "../../../../hooks/useNormalizeSettings";
import {useAlert} from "../../../../hooks/dialog/useAlert";
import {DATE_FORMAT} from "../../../../utils/constants";
import Select from "../../../../components/common/formComponents/select";

interface Props{
  id?: number
}

interface FormValues {
  id: number;
  name: string;
  qty: number;
  concurrency: number;
  relay_account_id: number;
  start_after_save: boolean;
  settings: any;
  non_field_error: string;
  /*
    NEW
    New Form Value  
  */ 
  cookies: string
}

const Form = (props: Props) => {
  const {push} = useRouter();
  const formHook = useForm<FormValues>({});
  const { handleSubmit, control, errors, setError, formState, clearErrors, register, setValue, getValues, watch } = formHook;
  const { loading, data } = useSelector((state: AppState) => state.campaigns);
  const { requestError } = useRequestErrors();
  const [savedTemplate , setSavedTemplate] = useState();
  const [tmpTemplate , setTmpTemplate] = useState();
  const [filter] = useState(new FilterService());
  const { normalizeSettings } = useNormalizeSettings();

  useEffect(() => {
    getData()
  }, [props.id]);

    const getData =  async () => {
        if(props.id) {
            try{
                filter.expand(['relayAccount']);
                const data = await campaignsActions.get(props.id, filter.filter);
                if(data.settings){
                    data.settings.map((item: any, index: number)=>{
                        appendRow(item, index)
                    })
                }
            }
            catch (e) { }
        }
        else{
            append({
                name: `Filters ${fields.length + 1}`
            });
            clearErrors('settings');
        }
    };

    const onSubmit = async (data: FormValues) => {
        const { non_field_error, ...formVal } : any = data;
        if(!formVal.start_after_save) formVal.start_after_save = false;
        if(props.id) formVal['id'] = props.id;

        if(formVal?.settings && formVal?.settings.length){
            formVal?.settings.map((settingsItem: any, i: number)=>{
                formVal.settings[i] = normalizeSettings(formVal.settings[i]);
            })
        }

        try{
            await campaignsActions.submit(formVal);
            notify.success('Successfully saved.')
            push(ADMIN_PATH.CAMPAIGNS);
        }
        catch (errors: any) {requestError(errors, setError)}
    };

    const saveAndStart = () => {
        setValue('start_after_save', true);
        setTimeout(()=>handleSubmit(onSubmit)(), 300);
    }

    const save = () => {
        setValue('start_after_save', false);
        setTimeout(()=>handleSubmit(onSubmit)(), 300);
    }

    const {fields, remove, append} = useFieldArray({control, name: `settings`});

    const addFilters = () => {
        append({
            name: `Filters ${fields.length + 1}`
        });
        clearErrors('settings');
    }

    const [tmpTemplateError, openTmpTemplateError]  = useAlert('Template','Please, choose template');

    const addFiltersByTemplate = async () => {
        if(!tmpTemplate) return openTmpTemplateError();
        clearErrors('settings');

        /*appendRow(tmpTemplate);*/
        remove(0);
        setTimeout(()=>{appendRow(tmpTemplate, 0);},100);
    }

    const appendRow = async (settingsData: any, index?: number) => {
        let settings = settingsData;
        if(settings?.start_time) {
            const time = settings?.start_time.match(/[0-9][0-9]:[0-9][0-9]/g)[0] || '';
            const date = settings?.start_date? moment(settings?.start_date).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY');
            settings['start_time']=`${date} ${time}`;
        }

        if(settings?.end_time) {
            const time = settings?.end_time.match(/[0-9][0-9]:[0-9][0-9]/g)[0] || '';
            const date = settings?.end_date? moment(settings?.end_date).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY');
            settings['end_time']=`${date} ${time}`;
        }

        await append({
            name: `Filters ${fields.length + 1}`,
            ...settings
        });

        setTimeout(()=>{
            setValue(`settings.${typeof index != 'undefined'? index : fields.length}`, settings);
        }, 300);
    }

    const dublicate = (idx: number) => {
        const values = getValues()['settings'][idx];
        appendRow(values);
    }

    const saveTemplate = (idx: number) => {
        const values = getValues()['settings'][idx];
        setSavedTemplate(values);
    }

  return (
    <>
      <ContentHeader id={props.id}
                     needBackLink={true}
                     modelName="Campaign"
                     urlSlug={ADMIN_PATH.CAMPAIGNS}
                     breadcrumbs={[
                       { url: ADMIN_MAIN, text: 'Dashboard' },
                       {url: ADMIN_PATH.CAMPAIGNS, text: 'Campaigns'},
                       {url: false, text: props.id? 'Edit' : 'Add'}]}>

          <Button type="button"
                  color={'success'}
                  onClick={()=>saveAndStart()}
                  disabled={formState.isSubmitting}
                  startIcon={
              <SvgIcon fontSize="small">
                  <TravelExploreIcon />
              </SvgIcon>
          }>
              Save & Start
          </Button>

          <Button type="button"
                  disabled={formState.isSubmitting}
                  onClick={()=>save()}>
              Save
          </Button>
      </ContentHeader>

      <Card  className="relative" style={{overflow: 'visible'}}>

          <Loader isLoading={loading} />
          <CRUDNotFound loading={loading} data={data} id={props.id} />

          {((props.id && data) || !props.id) &&  (
              <FormProvider {...formHook}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="admin-form">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                      <TextField
                        error={Boolean(errors.name?.message)}
                        helperText={errors.name?.message}
                        defaultValue={data?.name}
                        name="name"
                        label="Name"
                      />
                    </Grid>

                    <Grid item xs={12}  sm={6}>
                      <TextField
                          error={Boolean(errors.qty?.message)}
                          helperText={errors.qty?.message}
                          defaultValue={data?.qty}
                          name="qty"
                          label="Truck Q-ty"
                          required={true}
                      />
                    </Grid>

                    {
                        /* 
                            NEW
                        
                            New Cookies Text Input — place it wherever you want in this component. 
                        */
                    
                    }

                    <Grid item xs={12}  sm={6}>
                      <TextField
                          error={Boolean(errors.cookies?.message)}
                          helperText={errors.cookies?.message}
                          defaultValue={data?.cookies}
                          onChange={() => clearErrors('cookies')}
                          name="cookies"
                          label="Cookies"
                          required={true}
                      />
                    </Grid>
                    {
                        /* 
                            NEW
                        
                            New Cookies Text Input — place it wherever you want in this component.
                        */
                    }

                    <Grid item xs={12}  sm={6}>
                        <Select name={`concurrency`}
                                label={'Concurrency'}
                                defaultValue={data?.concurrency || 5}
                                variants={[1,2,3,4,5]}
                                error={Boolean(errors?.concurrency?.message)}
                                onChange={()=>clearErrors('concurrency')}
                                helperText={errors?.concurrency?.message}/>
                    </Grid>

                      <Grid item xs={12}>
                          <Autocomplete name={'relay_account_id'}
                                        error={Boolean(errors.relay_account_id?.message)}
                                        helperText={errors.relay_account_id?.message}
                                        onChange={()=>clearErrors('relay_account_id')}
                                        label={'Account*'}
                                        labelName={'login'}
                                        defaultValue={data?.relations?.relayAccount?
                                            {
                                                login: data.relations.relayAccount.login,
                                                id: data.relations.relayAccount.id
                                            } : undefined}
                                        searchParams={{
                                            url: accountUrl,
                                            limit: 10,
                                            searchBy: ['login']
                                        }} />
                      </Grid>

                    <Grid item xs={12} container spacing={2} alignItems={'start'}>
                       {/* <Grid item xs={12} sm={4}>
                            <Button fullWidth={true} startIcon={
                                        <SvgIcon fontSize="small">
                                            <AddIcon />
                                        </SvgIcon>
                                    }
                                    onClick={addFilters}>
                                Add filters
                            </Button>
                        </Grid>*/}
                        <Grid item xs={12} sm={6}>
                        <Autocomplete name={'template'}
                                      onChange={(e)=>setTmpTemplate(e?.settings)}
                                      label={'Choose filters template'}
                                      size={'small'}
                                      searchParams={{
                                          url: searchTemplateUrl,
                                          limit: 10,
                                          searchBy: ['name']
                                      }} />

                        {errors['settings'] && (
                            <div className="error-text">{errors['settings']?.message}</div>
                        )}
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button fullWidth={true} onClick={addFiltersByTemplate}>OK</Button>
                        </Grid>
                    </Grid>
                  </Grid>
                    </div>

                    <Grid item xs={12}>
                        {fields.map((item, idx) => {
                            const settingErrors : any = errors?.settings &&  errors?.settings[idx]? errors.settings[idx] : null;
                            const baseName = `settings.${idx}`;

                            return (
                            <div className={'filtersBlock'}>
                                <div className={'filtersTitle'}>
                                    <div  className={'filtersTitleText'}>Filter #{idx+1}</div>
                                    <div>
                                       {/* <Button color={'primary'}
                                                onClick={() => dublicate(idx)}
                                                size={"small"}
                                                variant={'outlined'}
                                                startIcon={<FileCopyIcon />}>Duplicate</Button>*/}

                                        <Button color={'primary'}
                                                onClick={() => saveTemplate(idx)}
                                                size={"small"}
                                                variant={'outlined'}
                                                startIcon={<SaveIcon />}>Save as template</Button>

                                       {/* <Button color={'secondary'}
                                                onClick={() => remove(idx)}
                                                size={"small"}
                                                variant={'text'}>Remove</Button>*/}
                                    </div>
                                </div>

                                <SearchTemplate formHook={formHook}
                                                baseName={baseName}
                                                data={item as TemplateForm}
                                                settingErrors={settingErrors}/>

                                {settingErrors && (
                                    <Alert severity="error">
                                        <div dangerouslySetInnerHTML={{__html:settingErrors?.message}}></div>
                                    </Alert>
                                )}
                            </div>
                            )
                            })}
                    </Grid>

                    <br/>

                    <div style={{display:'none'}}><Checkbox name={`start_after_save`} label={''}/></div>

                    {errors['non_field_error'] && (
                      <div className="error-text">{errors['non_field_error']?.message}</div>
                    )}

                </form>
              </FormProvider>
          )}
      </Card>


        {/*SAVE TEMPLATE MODAL*/}
        <SaveTemplateModal open={Boolean(savedTemplate)}
                           settings={savedTemplate}
                           onCLose={()=>setSavedTemplate(undefined)} />

        {tmpTemplateError}
    </>
  );
};

export default Form;
